export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initDiscordBot } = await import("./discordBot");
      await initDiscordBot();
    } catch (error) {
      console.error("Failed to initialize Discord bot:", error);
    }
  }
}
