import messages from "@/i18n/messages/en/common.json"; // Adjust path to your default message file

declare module "next-intl" {
  interface AppConfig {
    Messages: {
      common: typeof messages;
    };
  }
}
