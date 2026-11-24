# Matches the live "SPA template" Transform Rule on spa-demo.super-cdn.com:
# static rewrite to /index.html, GET/HEAD, extensionless paths.
# The API/Terraform body omits uri.query (the query string is left unchanged).
#
# If the zone already has an http_request_transform ruleset, import it and
# merge this rule. Do not apply a second ruleset for the same phase.

variable "cloudflare_zone_id" {
  type = string
}

variable "spa_hostname" {
  type        = string
  description = "Public SPA hostname. Live demo uses spa-demo.super-cdn.com."
}

resource "cloudflare_ruleset" "spa_url_rewrite" {
  zone_id     = var.cloudflare_zone_id
  name        = "SPA URL rewrites"
  description = "Serve /index.html for extensionless SPA routes."
  kind        = "zone"
  phase       = "http_request_transform"

  rules = [{
    ref         = "spa_template"
    description = "SPA template"
    expression  = "(http.host eq \"${var.spa_hostname}\" and http.request.method in {\"GET\" \"HEAD\"} and http.request.uri.path.extension eq \"\")"
    action      = "rewrite"
    enabled     = true
    action_parameters = {
      uri = {
        path = {
          value = "/index.html"
        }
      }
    }
  }]
}
