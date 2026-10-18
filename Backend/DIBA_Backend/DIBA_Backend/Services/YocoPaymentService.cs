using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace DIBA_Backend.Services
{
    public class YocoPaymentService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public YocoPaymentService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<YocoCheckoutResponse?> CreateCheckoutAsync(
            decimal amount,
            string reference)
        {
            var secretKey = _configuration["Yoco:SecretKey"];
            var frontendBaseUrl = _configuration["Frontend:BaseUrl"]?.TrimEnd('/');
            var successUrl = ResolveReturnUrl(
                _configuration["Yoco:SuccessUrl"], frontendBaseUrl, "/payment/success");
            var cancelUrl = ResolveReturnUrl(
                _configuration["Yoco:CancelUrl"], frontendBaseUrl, "/payment/cancel");

            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new InvalidOperationException(
                    "Yoco secret key is not configured.");
            }

            var amountInCents = (long)Math.Round(
                amount * 100,
                MidpointRounding.AwayFromZero);

            var requestBody = new
            {
                amount = amountInCents,
                currency = "ZAR",
                successUrl = successUrl,
                cancelUrl = cancelUrl,
                metadata = new
                {
                    reference = reference
                }
            };

            var json = JsonSerializer.Serialize(requestBody);

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://payments.yoco.com/api/checkouts");

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    secretKey);

            request.Content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(request);

            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Yoco checkout creation failed. " +
                    $"Status: {(int)response.StatusCode}. " +
                    $"Response: {responseContent}");
            }

            var result =
                JsonSerializer.Deserialize<YocoCheckoutResponse>(
                    responseContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

            return result;
        }
    }

    private static string ResolveReturnUrl(string? configuredUrl, string? frontendBaseUrl, string path)
    {
        var hasFrontendBaseUrl = Uri.TryCreate(frontendBaseUrl, UriKind.Absolute, out var frontendUri);
        var configuredUrlIsLocal =
            Uri.TryCreate(configuredUrl, UriKind.Absolute, out var configuredUri) &&
            (configuredUri.IsLoopback ||
             configuredUri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase));

        // Local settings sometimes contain https://localhost even though the React
        // development server runs on http://localhost:3000. Always use the frontend
        // base URL for local return links so the scheme and port match the app.
        if (configuredUrlIsLocal)
        {
            if (hasFrontendBaseUrl)
            {
                return $"{frontendBaseUrl}{path}";
            }

            return configuredUrl!;
        }

        // Keep an explicitly configured public URL for deployed environments.
        if (!string.IsNullOrWhiteSpace(configuredUrl))
        {
            return configuredUrl;
        }

        if (hasFrontendBaseUrl)
        {
            return $"{frontendBaseUrl}{path}";
        }

        throw new InvalidOperationException(
            $"Yoco return URL for {path} is not configured.");
    }

    public class YocoCheckoutResponse
    {
        public string? Id { get; set; }

        public string? RedirectUrl { get; set; }

        public string? Status { get; set; }
    }
}