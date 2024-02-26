import {
    ViewerApp,
    addBasePlugins,
    FileTransferPlugin,
    CanvasSnipperPlugin,
    Vector3,
} from "webgi";
import "./styles.css";

// Ensure the viewer is set up after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', setupViewer);

async function setupViewer() {
    const canvas = document.getElementById('webgi-canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found!');
        return; // Exit the function if the canvas is not found
    }

    const viewer = new ViewerApp({
        canvas: canvas,
    });

    // Add essential plugins
    await addBasePlugins(viewer);
    await viewer.addPlugin(FileTransferPlugin);
    await viewer.addPlugin(CanvasSnipperPlugin);

    // Set an initial environment map
    await viewer.setEnvironmentMap("./assets/HDRi/day.hdr");

    viewer.scene.activeCamera.position = new Vector3(-5, 2.5, 5);
    viewer.scene.activeCamera.target = new Vector3(0, 0.75, 0);

    setupDayNightToggle(viewer);

    const spinner = document.getElementById('spinner');
    showSpinner(document.getElementById('spinner')!);

    // Array of model paths
    const modelPaths = [
        "./assets/Models/Wall.glb",
        "./assets/Models/Floor.glb",
        "./assets/Models/Carpet.glb",
        "./assets/Models/Window.glb",
        "./assets/Models/Coffee_Table.glb",
        "./assets/Models/Frame.glb",
        "./assets/Models/Plant.glb",
        "./assets/Models/Sofa_Default.glb",
        "./assets/Models/Floor_Lamp.glb",
    ];

    try {
        // Sequentially load each model
        for (const path of modelPaths) {
            console.log(`Loading model: ${path}`);
            await viewer.load(path); // Load the model
        }
    } catch (error) {
        console.error("An error occurred while loading models:", error);
    } finally {
        hideSpinner(document.getElementById('spinner')!);
    }
}

function setupDayNightToggle(viewer: ViewerApp) {
    const toggle = document.querySelector('#dayNightToggle input[type="checkbox"]');
    if (toggle instanceof HTMLInputElement) { // Checking if toggle is not null and is an HTMLInputElement
        toggle.addEventListener('change', async (event) => {
            // No need for the 'as HTMLInputElement' assertion here anymore
            if (toggle.checked) {
                // Day settings
                await setDayEnvironment(viewer);
            } else {
                // Night settings
                await setNightEnvironment(viewer);
            }
        });
    } else {
        console.error("Day/Night toggle switch not found!");
    }
}

async function setDayEnvironment(viewer: ViewerApp) {
    const spinner = document.getElementById('spinner'); // Ensure this matches your spinner's ID
    if (spinner) showSpinner(spinner);
    try {
        await viewer.setEnvironmentMap("./assets/HDRi/day.hdr");
        // Include any additional adjustments for the day environment here
    } catch (error) {
        console.error("Failed to set day environment:", error);
    } finally {
        if (spinner) hideSpinner(spinner);
    }
}

async function setNightEnvironment(viewer: ViewerApp) {
    const spinner = document.getElementById('spinner'); // Ensure this matches your spinner's ID
    if (spinner) showSpinner(spinner);
    try {
        await viewer.setEnvironmentMap("./assets/HDRi/night.hdr");
        // Include any additional adjustments for the night environment here
    } catch (error) {
        console.error("Failed to set night environment:", error);
    } finally {
        if (spinner) hideSpinner(spinner);
    }
}

function showSpinner(spinner: HTMLElement): void {
    spinner.style.display = 'block';
}

function hideSpinner(spinner: HTMLElement): void {
    spinner.style.display = 'none';
}

