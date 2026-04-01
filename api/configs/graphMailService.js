import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const serviceMail = process.env.SERVICE_MAIL;

// Create Azure credential
const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
);

// Create Graph client
const graphClient = Client.initWithMiddleware({
    authProvider: {
        getAccessToken: async () => {
            const token = await credential.getToken(
                "https://graph.microsoft.com/.default"
            );
            return token.token;
        },
    },
});

// Send mail function
export const sendServiceMail = async ({ to, subject, html }) => {
    try {
        await graphClient.api(`/users/${serviceMail}/sendMail`).post({
            message: {
                subject,
                body: {
                    contentType: "HTML",
                    content: html,
                },
                toRecipients: [
                    {
                    emailAddress: { address: to },
                    },
                ],
            },
        });

        console.log("Mail sent successfully via Graph API");
    } catch (error) {
        console.error("Graph mail error:", error);
        throw error;
    }
};
