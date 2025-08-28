import { globalShortcut, app } from "electron"
import { IShortcutsHelperDeps } from "./main"
import { configHelper } from "./ConfigHelper"

export class ShortcutsHelper {
  private deps: IShortcutsHelperDeps

  constructor(deps: IShortcutsHelperDeps) {
    this.deps = deps
  }

  private adjustOpacity(delta: number): void {
    const mainWindow = this.deps.getMainWindow();
    if (!mainWindow) return;
    
    let currentOpacity = mainWindow.getOpacity();
    let newOpacity = Math.max(0.1, Math.min(1.0, currentOpacity + delta));
    console.log(`Adjusting opacity from ${currentOpacity} to ${newOpacity}`);
    
    mainWindow.setOpacity(newOpacity);
    
    // Save the opacity setting to config without re-initializing the client
    try {
      const config = configHelper.loadConfig();
      config.opacity = newOpacity;
      configHelper.saveConfig(config);
    } catch (error) {
      console.error('Error saving opacity to config:', error);
    }
    
    // If we're making the window visible, also make sure it's shown and interaction is enabled
    if (newOpacity > 0.1 && !this.deps.isVisible()) {
      this.deps.toggleMainWindow();
    }
  }

  public registerGlobalShortcuts(): void {
    globalShortcut.register("CommandOrControl+H", async () => {
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        console.log("Taking screenshot...")
        try {
          const screenshotPath = await this.deps.takeScreenshot()
          const preview = await this.deps.getImagePreview(screenshotPath)
          mainWindow.webContents.send("screenshot-taken", {
            path: screenshotPath,
            preview
          })
        } catch (error) {
          console.error("Error capturing screenshot:", error)
        }
      }
    })

    globalShortcut.register("CommandOrControl+Enter", async () => {
      console.log("CommandOrControl+Enter pressed - triggering unified chat processing")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Send event to renderer to trigger the unified IPC flow
        mainWindow.webContents.send("ctrl-enter-pressed")
      }
    })

    globalShortcut.register("CommandOrControl+R", () => {
      console.log("=== CTRL+R PRESSED - Starting comprehensive reset ===")

      try {
        // Cancel ongoing API requests
        console.log("1. Canceling ongoing requests...")
        this.deps.processingHelper?.cancelOngoingRequests()

        // Clear both screenshot queues
        console.log("2. Clearing screenshot queues...")
        this.deps.clearQueues()

        // Clear chat history directly
        console.log("3. Clearing chat history...")
        const config = configHelper.loadConfig();
        config.chatHistory = [];
        configHelper.saveConfig(config);
        console.log("   Chat history cleared from config")

        // Update the view state to 'queue'
        console.log("4. Setting view to queue...")
        this.deps.setView("queue")

        // Notify renderer process to switch view to 'queue' and clear chat
        console.log("5. Sending UI reset events...")
        const mainWindow = this.deps.getMainWindow()
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("reset-view")
          console.log("   Sent reset-view event")
          mainWindow.webContents.send("reset")
          console.log("   Sent reset event")
          mainWindow.webContents.send("chat-history-cleared")
          console.log("   Sent chat-history-cleared event")
        }

        console.log("=== CTRL+R RESET COMPLETED SUCCESSFULLY ===")
      } catch (error) {
        console.error("=== ERROR IN CTRL+R RESET ===", error)
      }
    })

    // Stop processing shortcut - Ctrl+Shift+S
    globalShortcut.register("CommandOrControl+Shift+S", async () => {
      console.log("=== CTRL+SHIFT+S PRESSED - Stopping processing ===")
      try {
        const mainWindow = this.deps.getMainWindow()
        if (mainWindow) {
          // Send event to trigger the stop processing via IPC
          mainWindow.webContents.send("stop-processing-requested");
          console.log("Stop processing event sent to renderer");
        }
      } catch (error) {
        console.error("=== ERROR IN CTRL+SHIFT+S STOP ===", error)
      }
    })

    // New shortcuts for moving the window
    globalShortcut.register("CommandOrControl+Left", () => {
      console.log("Command/Ctrl + Left pressed. Moving window left.")
      this.deps.moveWindowLeft()
    })

    globalShortcut.register("CommandOrControl+Right", () => {
      console.log("Command/Ctrl + Right pressed. Moving window right.")
      this.deps.moveWindowRight()
    })

    globalShortcut.register("CommandOrControl+Down", () => {
      console.log("Command/Ctrl + down pressed. Moving window down.")
      this.deps.moveWindowDown()
    })

    globalShortcut.register("CommandOrControl+Up", () => {
      console.log("Command/Ctrl + Up pressed. Moving window Up.")
      this.deps.moveWindowUp()
    })

    globalShortcut.register("CommandOrControl+B", () => {
      console.log("Command/Ctrl + B pressed. Toggling window visibility.")
      this.deps.toggleMainWindow()
    })

    globalShortcut.register("CommandOrControl+Q", () => {
      console.log("Command/Ctrl + Q pressed. Quitting application.")
      app.quit()
    })

    // Adjust opacity shortcuts
    globalShortcut.register("CommandOrControl+[", () => {
      console.log("Command/Ctrl + [ pressed. Decreasing opacity.")
      this.adjustOpacity(-0.1)
    })

    globalShortcut.register("CommandOrControl+]", () => {
      console.log("Command/Ctrl + ] pressed. Increasing opacity.")
      this.adjustOpacity(0.1)
    })
    
    // Zoom controls
    globalShortcut.register("CommandOrControl+-", () => {
      console.log("Command/Ctrl + - pressed. Zooming out.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomLevel()
        mainWindow.webContents.setZoomLevel(currentZoom - 0.5)
      }
    })
    
    globalShortcut.register("CommandOrControl+0", () => {
      console.log("Command/Ctrl + 0 pressed. Resetting zoom.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.setZoomLevel(0)
      }
    })
    
    globalShortcut.register("CommandOrControl+=", () => {
      console.log("Command/Ctrl + = pressed. Zooming in.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        const currentZoom = mainWindow.webContents.getZoomLevel()
        mainWindow.webContents.setZoomLevel(currentZoom + 0.5)
      }
    })
    
    // Delete last screenshot shortcut
    globalShortcut.register("CommandOrControl+L", async () => {
      console.log("Command/Ctrl + L pressed. Deleting last screenshot.")
      try {
        // Use the same logic as the IPC handler
        const mainWindow = this.deps.getMainWindow()
        if (mainWindow) {
          // Trigger the delete-last-screenshot IPC handler
          const result = await mainWindow.webContents.executeJavaScript(`
            window.electronAPI.deleteLastScreenshot()
          `)
          console.log("Delete last screenshot result:", result)
        }
      } catch (error) {
        console.error("Error deleting last screenshot via Ctrl+L:", error)
      }
    })
    
    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })
  }
}
