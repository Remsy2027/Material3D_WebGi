import {
    ViewerApp,
    addBasePlugins,
    FileTransferPlugin,
    CanvasSnipperPlugin,
    Vector3,
    RepeatWrapping, ShaderMaterial, TextureLoader, UniformsUtils, DoubleSide,
} from "webgi";
import { SubsurfaceScatteringShader } from 'three/examples/jsm/shaders/SubsurfaceScatteringShader';
import "./styles.css";

let specificObject: THREE.Object3D | undefined;
document.addEventListener('DOMContentLoaded', setupViewer);

async function setupViewer() {
    const canvas = document.getElementById('webgi-canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const viewer = new ViewerApp({ canvas });
    await addBasePlugins(viewer);
    await viewer.addPlugin(FileTransferPlugin);
    await viewer.addPlugin(CanvasSnipperPlugin);
    await viewer.setEnvironmentMap("./assets/HDRi/day.hdr");

    viewer.scene.activeCamera.position = new Vector3(-5, 2.5, 5);
    viewer.scene.activeCamera.target = new Vector3(0, 0.75, 0);

    const spinner = document.getElementById('spinner');
    if (spinner) showSpinner(spinner);

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
        for (const path of modelPaths) {
            console.log(`Loading model: ${path}`);
            await viewer.load(path);
        }
        await turnOffFloorLampLights(viewer);
    } catch (error) {
        console.error("An error occurred while loading models:", error);
    } finally {
        if (spinner) hideSpinner(spinner);
    }

    const spinnerElement = document.getElementById('spinner');
    if (spinnerElement instanceof HTMLElement) {
        setupDayNightToggle(viewer, spinnerElement); // Correctly typed as HTMLElement
    } else {
        console.error("Spinner element not found or is not correctly typed.");
    }
}

async function turnOffFloorLampLights(viewer: ViewerApp) {
    const floorLampLights = viewer.scene.findObjectsByName("FloorLampLight");
    floorLampLights.forEach(lampLight => lampLight.visible = false);
}

function setupDayNightToggle(viewer: ViewerApp, spinner: HTMLElement) {
    const toggle = document.querySelector('#dayNightToggle input[type="checkbox"]') as HTMLInputElement;
    if (!toggle) {
        console.error("Day/Night toggle switch not found!");
        return;
    }

    toggle.addEventListener('change', async () => {
        if (spinner) showSpinner(spinner);
        try {
            if (toggle.checked) {
                await setDayEnvironment(viewer, spinner);
            } else {
                await setNightEnvironment(viewer, spinner);
            }
        } finally {
            if (spinner) hideSpinner(spinner);
        }
    });
}

async function setDayEnvironment(viewer: ViewerApp, spinner: HTMLElement) {
    try {
        await viewer.setEnvironmentMap("./assets/HDRi/day.hdr");
        await turnOffFloorLampLights(viewer);
    } catch (error) {
        console.error("Failed to set day environment:", error);
    }
}

async function setNightEnvironment(viewer: ViewerApp, spinner: HTMLElement) {
    try {
        await viewer.setEnvironmentMap("./assets/HDRi/night.hdr");
        const floorLampLights = viewer.scene.findObjectsByName("FloorLampLight");
        floorLampLights.forEach(lampLight => lampLight.visible = true);
    } catch (error) {
        console.error("Failed to set night environment:", error);
    }
}

function createSubsurfaceMaterial() {
    const texLoader = new TextureLoader();
    const subTexture = texLoader.load('./assets/Texture/Subsurface.jpg');
    subTexture.wrapS = subTexture.wrapT = RepeatWrapping;
    subTexture.repeat.set(4, 4);

    const shader = SubsurfaceScatteringShader;
    const uniforms = UniformsUtils.clone(shader.uniforms);

    uniforms['diffuse'].value = new Vector3(0.9, 0.7, 0.5);
    uniforms['shininess'].value = 10;
    uniforms['thicknessMap'].value = subTexture;
    uniforms['thicknessColor'].value = new Vector3(0.560784, 0.266667, 0.054902);
    uniforms['thicknessDistortion'].value = 0.1;
    uniforms['thicknessAmbient'].value = 0.4;
    uniforms['thicknessAttenuation'].value = 0.7;
    uniforms['thicknessPower'].value = 10.0;
    uniforms['thicknessScale'].value = 1;

    return new ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        lights: true,
        side: DoubleSide,
    });
}

function replaceMaterial(model: THREE.Object3D, materialName: string, newMaterial: THREE.Material) {
    model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.name === materialName) {
            (child as THREE.Mesh).material = newMaterial;
        }
    });
}

const subsurfaceScatteringMaterial = createSubsurfaceMaterial();

function showSpinner(spinner: HTMLElement): void {
    spinner.style.display = 'block';
}

function hideSpinner(spinner: HTMLElement): void {
    spinner.style.display = 'none';
}
