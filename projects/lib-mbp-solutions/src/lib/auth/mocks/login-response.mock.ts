const LOGIN_RESPONSE_MOCK = {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtLmJ1aXRyYWdvQG1icHNvbHV0aW9ucy5jb20iLCJpYXQiOjE3NzAwNzE3ODYsImV4cCI6MTc3MDA3NTM4NiwidGVuYW50SWQiOjEsInRlbmFudFN1YmRvbWFpbiI6Im1icC1zb2x1dGlvbnMiLCJ1c2VySWQiOjIsInJvbGVzIjpbIkFETUlOIl0sInBlcm1pc3Npb25zIjpbIlBST0RVQ1RfUkVBRCIsIlBST0RVQ1RfV1JJVEUiXX0.WrI623zWGmqHAd2CZVtfx1bqz7h05tsbthC-6JN6Mhs",
    "user": {
        "active": true,
        "createdAt": "2026-02-02T19:26:11Z",
        "email": "m.buitrago@mbpsolutions.com",
        "id": 2,
        "name": "Mauricio Buitrago",
        "roles": [
            {
                "id": 1,
                "name": "ADMIN",
                "description": "Administrador",
                "permissions": [
                    {
                        "id": 1,
                        "code": "PRODUCT_READ",
                        "description": "Ver productos"
                    },
                    {
                        "id": 2,
                        "code": "PRODUCT_WRITE",
                        "description": "Crear/editar productos"
                    }
                ]
            }
        ]
    },
    "tenant": {
        "id": 1,
        "subdomain": "mbp-solutions",
        "name": "MBP`Solutions"
    }
}
