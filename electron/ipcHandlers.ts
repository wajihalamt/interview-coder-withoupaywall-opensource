// ipcHandlers.ts

import { ipcMain, shell, dialog, app } from "electron"
import * as fs from 'fs'
import { randomBytes } from "crypto"
import { IIpcHandlerDeps } from "./main"
import { configHelper } from "./ConfigHelper"

export function initializeIpcHandlers(deps: IIpcHandlerDeps): void {
  console.log("Initializing IPC handlers")

  // Configuration handlers
  ipcMain.handle("get-config", () => {
    return configHelper.loadConfig();
  })

  ipcMain.handle("update-config", (_event, updates) => {
    return configHelper.updateConfig(updates);
  })

  ipcMain.handle("check-api-key", () => {
    return configHelper.hasApiKey();
  })
  
  ipcMain.handle("validate-api-key", async (_event, apiKey) => {
    // First check the format
    if (!configHelper.isValidApiKeyFormat(apiKey)) {
      return { 
        valid: false, 
        error: "Invalid API key format. OpenAI API keys start with 'sk-'" 
      };
    }
    
    // Then test the API key with OpenAI
    const result = await configHelper.testApiKey(apiKey);
    return result;
  })

  // Credits handlers
  ipcMain.handle("set-initial-credits", async (_event, credits: number) => {
    const mainWindow = deps.getMainWindow()
    if (!mainWindow) return

    try {
      // Set the credits in a way that ensures atomicity
      await mainWindow.webContents.executeJavaScript(
        `window.__CREDITS__ = ${credits}`
      )
      mainWindow.webContents.send("credits-updated", credits)
    } catch (error) {
      console.error("Error setting initial credits:", error)
      throw error
    }
  })

  ipcMain.handle("decrement-credits", async () => {
    const mainWindow = deps.getMainWindow()
    if (!mainWindow) return

    try {
      const currentCredits = await mainWindow.webContents.executeJavaScript(
        "window.__CREDITS__"
      )
      if (currentCredits > 0) {
        const newCredits = currentCredits - 1
        await mainWindow.webContents.executeJavaScript(
          `window.__CREDITS__ = ${newCredits}`
        )
        mainWindow.webContents.send("credits-updated", newCredits)
      }
    } catch (error) {
      console.error("Error decrementing credits:", error)
    }
  })

  // Screenshot queue handlers
  ipcMain.handle("get-screenshot-queue", () => {
    return deps.getScreenshotQueue()
  })

  ipcMain.handle("get-extra-screenshot-queue", () => {
    return deps.getExtraScreenshotQueue()
  })

  ipcMain.handle("delete-screenshot", async (event, path: string) => {
    return deps.deleteScreenshot(path)
  })

  ipcMain.handle("get-image-preview", async (event, path: string) => {
    return deps.getImagePreview(path)
  })

  // Screenshot processing handlers
  ipcMain.handle("process-screenshots", async () => {
    // Check for API key before processing
    if (!configHelper.hasApiKey()) {
      const mainWindow = deps.getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send(deps.PROCESSING_EVENTS.API_KEY_INVALID);
      }
      return;
    }
    
    await deps.processingHelper?.processScreenshots()
  })

  // Window dimension handlers
  ipcMain.handle(
    "update-content-dimensions",
    async (event, { width, height }: { width: number; height: number }) => {
      if (width && height) {
        deps.setWindowDimensions(width, height)
      }
    }
  )

  ipcMain.handle(
    "set-window-dimensions",
    (event, width: number, height: number) => {
      deps.setWindowDimensions(width, height)
    }
  )

  // Screenshot management handlers
  ipcMain.handle("get-screenshots", async () => {
    try {
      let previews = []
      const currentView = deps.getView()

      if (currentView === "queue") {
        const queue = deps.getScreenshotQueue()
        previews = await Promise.all(
          queue.map(async (path) => ({
            path,
            preview: await deps.getImagePreview(path)
          }))
        )
      } else {
        const extraQueue = deps.getExtraScreenshotQueue()
        previews = await Promise.all(
          extraQueue.map(async (path) => ({
            path,
            preview: await deps.getImagePreview(path)
          }))
        )
      }

      return previews
    } catch (error) {
      console.error("Error getting screenshots:", error)
      throw error
    }
  })

  // Screenshot trigger handlers
  ipcMain.handle("trigger-screenshot", async () => {
    const mainWindow = deps.getMainWindow()
    if (mainWindow) {
      try {
        const screenshotPath = await deps.takeScreenshot()
        const preview = await deps.getImagePreview(screenshotPath)
        mainWindow.webContents.send("screenshot-taken", {
          path: screenshotPath,
          preview
        })
        return { success: true }
      } catch (error) {
        console.error("Error triggering screenshot:", error)
        return { error: "Failed to trigger screenshot" }
      }
    }
    return { error: "No main window available" }
  })

  ipcMain.handle("take-screenshot", async () => {
    try {
      const screenshotPath = await deps.takeScreenshot()
      const preview = await deps.getImagePreview(screenshotPath)
      return { path: screenshotPath, preview }
    } catch (error) {
      console.error("Error taking screenshot:", error)
      return { error: "Failed to take screenshot" }
    }
  })

  // Auth-related handlers removed

  ipcMain.handle("open-external-url", (event, url: string) => {
    shell.openExternal(url)
  })
  
  // Open external URL handler
  ipcMain.handle("openLink", (event, url: string) => {
    try {
      console.log(`Opening external URL: ${url}`);
      shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error(`Error opening URL ${url}:`, error);
      return { success: false, error: `Failed to open URL: ${error}` };
    }
  })

  // Settings portal handler
  ipcMain.handle("open-settings-portal", () => {
    const mainWindow = deps.getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send("show-settings-dialog");
      return { success: true };
    }
    return { success: false, error: "Main window not available" };
  })

  // Window management handlers
  ipcMain.handle("toggle-window", () => {
    try {
      deps.toggleMainWindow()
      return { success: true }
    } catch (error) {
      console.error("Error toggling window:", error)
      return { error: "Failed to toggle window" }
    }
  })

  ipcMain.handle("reset-queues", async () => {
    try {
      deps.clearQueues()
      return { success: true }
    } catch (error) {
      console.error("Error resetting queues:", error)
      return { error: "Failed to reset queues" }
    }
  })

  // Process screenshot handlers
  ipcMain.handle("trigger-process-screenshots", async () => {
    try {
      // Check for API key before processing
      if (!configHelper.hasApiKey()) {
        const mainWindow = deps.getMainWindow();
        if (mainWindow) {
          mainWindow.webContents.send(deps.PROCESSING_EVENTS.API_KEY_INVALID);
        }
        return { success: false, error: "API key required" };
      }
      
      await deps.processingHelper?.processScreenshots()
      return { success: true }
    } catch (error) {
      console.error("Error processing screenshots:", error)
      return { error: "Failed to process screenshots" }
    }
  })

  // Reset handlers
  ipcMain.handle("trigger-reset", () => {
    try {
      // First cancel any ongoing requests
      deps.processingHelper?.cancelOngoingRequests()

      // Clear all queues immediately
      deps.clearQueues()

      // Clear chat history
      const config = configHelper.loadConfig();
      config.chatHistory = [];
      configHelper.saveConfig(config);
      console.log("Chat history cleared during reset");

      // Reset view to queue
      deps.setView("queue")

      // Get main window and send reset events
      const mainWindow = deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Send reset events in sequence
        mainWindow.webContents.send("reset-view")
        mainWindow.webContents.send("reset")
        mainWindow.webContents.send("chat-history-cleared") // Notify frontend to clear chat
      }

      return { success: true }
    } catch (error) {
      console.error("Error triggering reset:", error)
      return { error: "Failed to trigger reset" }
    }
  })

  // Window movement handlers
  ipcMain.handle("trigger-move-left", () => {
    try {
      deps.moveWindowLeft()
      return { success: true }
    } catch (error) {
      console.error("Error moving window left:", error)
      return { error: "Failed to move window left" }
    }
  })

  ipcMain.handle("trigger-move-right", () => {
    try {
      deps.moveWindowRight()
      return { success: true }
    } catch (error) {
      console.error("Error moving window right:", error)
      return { error: "Failed to move window right" }
    }
  })

  ipcMain.handle("trigger-move-up", () => {
    try {
      deps.moveWindowUp()
      return { success: true }
    } catch (error) {
      console.error("Error moving window up:", error)
      return { error: "Failed to move window up" }
    }
  })

  ipcMain.handle("trigger-move-down", () => {
    try {
      deps.moveWindowDown()
      return { success: true }
    } catch (error) {
      console.error("Error moving window down:", error)
      return { error: "Failed to move window down" }
    }
  })
  
  // Delete last screenshot handler
  ipcMain.handle("delete-last-screenshot", async () => {
    try {
      // Check both queues to find screenshots
      const mainQueue = deps.getScreenshotQueue()
      const extraQueue = deps.getExtraScreenshotQueue()
      const currentView = deps.getView()
      
      console.log("Delete last screenshot debug:")
      console.log("- Current view:", currentView)
      console.log("- Main queue length:", mainQueue.length)
      console.log("- Extra queue length:", extraQueue.length)
      console.log("- Main queue contents:", mainQueue)
      console.log("- Extra queue contents:", extraQueue)
      
      let queue: string[]
      let queueName: string
      
      // Prefer the current view's queue, but fall back to whichever has screenshots
      if (currentView === "queue" && mainQueue.length > 0) {
        queue = mainQueue
        queueName = "main"
      } else if (currentView !== "queue" && extraQueue.length > 0) {
        queue = extraQueue
        queueName = "extra"
      } else if (mainQueue.length > 0) {
        queue = mainQueue
        queueName = "main"
      } else if (extraQueue.length > 0) {
        queue = extraQueue
        queueName = "extra"
      } else {
        console.log("No screenshots found in either queue")
        return { success: false, error: "No screenshots to delete" }
      }
      
      console.log(`Deleting last screenshot from ${queueName} queue (${queue.length} screenshots)`)
      
      // Get the last screenshot in the selected queue
      const lastScreenshot = queue[queue.length - 1]
      console.log("About to delete screenshot:", lastScreenshot)
      
      // Delete it
      const result = await deps.deleteScreenshot(lastScreenshot)
      console.log("Delete result:", result)
      
      // Notify the renderer about the change
      const mainWindow = deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("screenshot-deleted", { path: lastScreenshot })
      }
      
      console.log("Returning result:", result)
      return result
    } catch (error) {
      console.error("Error deleting last screenshot:", error)
      return { success: false, error: "Failed to delete last screenshot" }
    }
  })

  // Window management handlers
  ipcMain.handle("minimize-window", () => {
    try {
      const mainWindow = deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.minimize()
        return { success: true }
      }
      return { success: false, error: "No main window available" }
    } catch (error) {
      console.error("Error minimizing window:", error)
      return { success: false, error: "Failed to minimize window" }
    }
  })

  // Chat history handlers
  ipcMain.handle("get-chat-history", () => {
    try {
      const config = configHelper.loadConfig();
      return {
        success: true,
        messages: config.chatHistory || []
      };
    } catch (error) {
      console.error("Error getting chat history:", error);
      return {
        success: false,
        messages: [],
        error: "Failed to load chat history"
      };
    }
  })

  ipcMain.handle("save-chat-message", (_event, message: any) => {
    try {
      const config = configHelper.loadConfig();
      if (!config.chatHistory) {
        config.chatHistory = [];
      }
      
      config.chatHistory.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 messages to prevent config file from getting too large
      if (config.chatHistory.length > 100) {
        config.chatHistory = config.chatHistory.slice(-100);
      }
      
      configHelper.saveConfig(config);
      
      return { success: true };
    } catch (error) {
      console.error("Error saving chat message:", error);
      return { 
        success: false, 
        error: "Failed to save chat message" 
      };
    }
  })

  ipcMain.handle("clear-chat-history", () => {
    try {
      const config = configHelper.loadConfig();
      config.chatHistory = [];
      configHelper.saveConfig(config);
      
      console.log("Chat history cleared");
      return { success: true };
    } catch (error) {
      console.error("Error clearing chat history:", error);
      return { 
        success: false, 
        error: "Failed to clear chat history" 
      };
    }
  })

  // Chat message handler
  ipcMain.handle("send-chat-message", async (_event, message: string) => {
    try {
      // Check for API key before sending chat message
      if (!configHelper.hasApiKey()) {
        return { 
          success: false, 
          error: "OpenAI API key not configured. Please set up your API key in settings." 
        };
      }

      console.log("Sending chat message to AI:", message.substring(0, 100) + "...");

      // Get the OpenAI client
      const openai = deps.getOpenAIClient?.();
      if (!openai) {
        return { 
          success: false, 
          error: "OpenAI client not initialized" 
        };
      }

      // Send the message to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant specialized in helping with coding problems, debugging, and programming questions. Provide clear, concise, and helpful responses."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        return { 
          success: false, 
          error: "No response received from AI" 
        };
      }

      console.log("AI response received:", aiResponse.substring(0, 100) + "...");

      return {
        success: true,
        message: aiResponse
      };

    } catch (error: any) {
      console.error("Error sending chat message:", error);
      
      // Handle specific OpenAI errors
      if (error?.error?.type === 'insufficient_quota') {
        return { 
          success: false, 
          error: "OpenAI API quota exceeded. Please check your OpenAI account." 
        };
      } else if (error?.error?.type === 'invalid_api_key') {
        return { 
          success: false, 
          error: "Invalid OpenAI API key. Please check your API key in settings." 
        };
      } else {
        return { 
          success: false, 
          error: error.message || "Failed to send message to AI" 
        };
      }
    }
  })

  // Process screenshots for chat
  ipcMain.handle("process-screenshots-for-chat", async () => {
    try {
      console.log("Processing screenshots for chat...");

      // Check for API key
      if (!configHelper.hasApiKey()) {
        return { 
          success: false, 
          error: "OpenAI API key not configured. Please set up your API key in settings." 
        };
      }

      // Get screenshot queue from deps
      const screenshotQueue = deps.getScreenshotQueue() || [];
      
      if (screenshotQueue.length === 0) {
        return {
          success: false,
          error: "No screenshots found. Please take some screenshots first using Ctrl+H."
        };
      }

      console.log(`Processing ${screenshotQueue.length} screenshots for chat`);

      // Use the existing processing helper
      const processingHelper = deps.processingHelper;
      if (!processingHelper) {
        return {
          success: false,
          error: "Processing helper not initialized"
        };
      }

      // Process screenshots using the same logic as the original processScreenshots
      const screenshots = await Promise.all(
        screenshotQueue.map(async (path: string) => {
          try {
            if (!fs.existsSync(path)) {
              console.warn(`Screenshot file does not exist: ${path}`);
              return null;
            }
            
            return {
              path,
              preview: await deps.getImagePreview(path) || '',
              data: fs.readFileSync(path).toString('base64')
            };
          } catch (err) {
            console.error(`Error reading screenshot ${path}:`, err);
            return null;
          }
        })
      );

      const validScreenshots = screenshots.filter(Boolean) as Array<{ path: string; preview: string; data: string }>;
      
      if (validScreenshots.length === 0) {
        return {
          success: false,
          error: "Failed to load screenshot data"
        };
      }

      // Call the processing helper's internal method to process screenshots
      // We need to access the private method, so we'll use type assertion
      const internalProcessingHelper = processingHelper as unknown as {
        processScreenshotsHelper: (screenshots: Array<{ path: string; data: string }>, signal: AbortSignal) => Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>
      };
      
      const result = await internalProcessingHelper.processScreenshotsHelper(validScreenshots, new AbortController().signal);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || "Failed to process screenshots"
        };
      }

      // Extract the relevant data for chat
      const data = result.data;
      const config = configHelper.loadConfig();
      
      return {
        success: true,
        problemStatement: data?.problem_statement || null,
        solution: data?.code || null,
        thoughts: data?.thoughts || null,
        timeComplexity: data?.time_complexity || null,
        spaceComplexity: data?.space_complexity || null,
        language: config.language || 'javascript'
      };

    } catch (error: unknown) {
      console.error("Error processing screenshots for chat:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific errors
      if (errorMessage.includes('API Key') || errorMessage.includes('OpenAI')) {
        return {
          success: false,
          error: "OpenAI API error. Please check your API key and quota."
        };
      }
      
      return {
        success: false,
        error: errorMessage || "Failed to process screenshots"
      };
    }
  })

  ipcMain.handle("quit-app", () => {
    try {
      // This will quit the entire application
      app.quit()
      return { success: true }
    } catch (error) {
      console.error("Error quitting app:", error)
      return { success: false, error: "Failed to quit application" }
    }
  })
}
