export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await import("./discordBot");
    } catch (error) {
      console.error("Failed to initialize Discord bot:", error);
    }
  }
}
