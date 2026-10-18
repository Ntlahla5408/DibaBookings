
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
            string reference,
            Guid bookingId)
        {
            var secretKey = _configuration["Yoco:SecretKey"];
            var frontendBaseUrl =
                _configuration["Frontend:BaseUrl"]?.TrimEnd('/');

            var successUrl = ResolveReturnUrl(
                _configuration["Yoco:SuccessUrl"],
                frontendBaseUrl,
                $"/payment/success?bookingId={bookingId:D}");

            var cancelUrl = ResolveReturnUrl(
                _configuration["Yoco:CancelUrl"],
                frontendBaseUrl,
                $"/payment/cancel?bookingId={bookingId:D}");

            Console.WriteLine($"Yoco success URL: {successUrl}");
            Console.WriteLine($"Yoco cancel URL: {cancelUrl}");

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
                successUrl,
                cancelUrl,
                metadata = new
                {
                    reference
                }
            };

            var json = JsonSerializer.Serialize(requestBody);

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://payments.yoco.com/api/checkouts");

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", secretKey);

            request.Content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(request);
            var responseContent =
                await response.Content.ReadAsStringAsync();

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

        private static string ResolveReturnUrl(
            string? configuredUrl,
            string? frontendBaseUrl,
            string path)
        {
            var hasFrontendBaseUrl =
                Uri.TryCreate(
                    frontendBaseUrl,
                    UriKind.Absolute,
                    out _);

            var isConfiguredUrlLocal =
                Uri.TryCreate(
                    configuredUrl,
                    UriKind.Absolute,
                    out var configuredUri) &&
                (configuredUri.IsLoopback ||
                 configuredUri.Host.Equals(
                     "localhost",
                     StringComparison.OrdinalIgnoreCase));

            // For local development, use the React application's base URL.
            if (isConfiguredUrlLocal)
            {
                if (hasFrontendBaseUrl)
                {
                    return $"{frontendBaseUrl}{path}";
                }

                return configuredUrl!;
            }

            // Preserve explicitly configured public URLs and add booking context.
            if (!string.IsNullOrWhiteSpace(configuredUrl))
            {
                var publicUrlBuilder = new UriBuilder(configuredUrl);
                var existingQuery =
                    publicUrlBuilder.Query.TrimStart('?');

                var returnQuery = path.Contains('?')
                    ? path[(path.IndexOf('?') + 1)..]
                    : string.Empty;

                var combinedQuery = new[]
                    {
                        existingQuery,
                        returnQuery
                    }
                    .Where(value => !string.IsNullOrWhiteSpace(value));

                publicUrlBuilder.Query =
                    string.Join("&", combinedQuery);

                return publicUrlBuilder.Uri.ToString();
            }

            if (hasFrontendBaseUrl)
            {
                return $"{frontendBaseUrl}{path}";
            }

            throw new InvalidOperationException(
                $"Yoco return URL for {path} is not configured.");
        }
    }

    public class YocoCheckoutResponse
    {
        public string? Id { get; set; }

        public string? RedirectUrl { get; set; }

        public string? Status { get; set; }
    }
}