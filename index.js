const saladBowl = document.querySelector('#bowl');
let toppingsList = [];

/***********************************************************
 create topping gltf model for bowl object
 ***********************************************************/
const gltfPhysicsObjectComponent = {
    schema: {
        model: { default: '' },
        body: { type: 'string', default: 'static' }, // dynamic: A freely-moving object
        shape: { type: 'string', default: 'mesh' }, // hull: Wraps a model in a convex hull, like a shrink-wrap
    },

    init() {
        const gltfmodel = document.createElement('a-entity');
        this.el.appendChild(gltfmodel);
        gltfmodel.object3D.position.set(0, 0.1, 0);
        gltfmodel.setAttribute('gltf-model', this.data.model);
        gltfmodel.setAttribute('shadow', { receive: false });
        // Specify  type of ammo-body (dynamic, static, kinematic)
        gltfmodel.setAttribute('ammo-body', { type: this.data.body });
        // Waiting for model to load before adding ammo-shape (box, cylinder, sphere, capsule, cone, hull)
        this.el.addEventListener('model-loaded', () => {
            gltfmodel.setAttribute('ammo-shape', {
                type: this.data.shape,
                disableCollision: true,
            });
        });
    },
};

AFRAME.registerComponent('physics-object', gltfPhysicsObjectComponent);

/***********************************************************
 create topping gltf model object
 ***********************************************************/
const gltfToppingsPhysicsObjectComponent = {
    multiple: true,
    schema: {
        model: { default: '' },
        name: { default: '' },
        body: { type: 'string', default: 'dynamic' }, // dynamic: A freely-moving object

        shape: { type: 'string', default: 'sphere' }, // hull: Wraps a model in a convex hull, like a shrink-wrap

        numOfEls: { default: 1 },
    },

    init() {
        const gltfmodel = document.createElement('a-entity');
        this.el.appendChild(gltfmodel);
        gltfmodel.setAttribute('gltf-model', this.data.model);
        gltfmodel.setAttribute('position', { x: 0, y: 8, z: -14 });
        gltfmodel.setAttribute('scale', { x: 1, y: 1, z: 1 });
        gltfmodel.setAttribute('class', this.data.name);
        // Specify type of ammo-body (dynamic, static, kinematic)
        gltfmodel.setAttribute('ammo-body', { type: this.data.body });
        gltfmodel.setAttribute('ammo-constraint', 'target: #bowl; type: slider;');

        this.el.addEventListener('model-loaded', () => {
            gltfmodel.setAttribute('ammo-shape', {
                type: this.data.shape,
                fit: 'manual',
                sphereRadius: 1,
            });
        });
    },

    remove() {
        const childNodesToRemove = this.el.getElementsByClassName(this.data.name);
        [...childNodesToRemove].forEach((child) => {
            child.parentNode.removeChild(child);
        });
    },
};

/*** Registering toppings component to AFrame ***/
const allowedToppings = [
    'tomato',
    'jalapeno',
    'tofu',
    'onion',
    'pineapple',
];

allowedToppings.forEach((topping) => {
    AFRAME.registerComponent(
        `topping-physics-${topping}-object`,
        gltfToppingsPhysicsObjectComponent
    );
});

/**********************************************************
 * @name: addOrRemoveFromToppings
 * @desc: Maintian list of toppings
 ***********************************************************/
const addOrRemoveFromToppings = (topping) => {
    const exists = toppingsList.includes(topping);

    if (exists) toppingsList = toppingsList.filter((c) => c !== topping);
    else toppingsList.push(topping);
};

/***********************************************************
 * @name: addTopping
 * @desc: Add topping to the salad
 ***********************************************************/
const addTopping = (e) => {
    const targetEl = document.querySelector('#toppingContainer');
    const isInput = e.target.getAttribute('type');
    if (isInput) {
        const isSelected = e.target.checked;
        const selectedTopping = e.target.getAttribute('name');

        console.log('Topping selected is =>', selectedTopping, isSelected, isInput);
        console.log(selectedTopping);
        if (isSelected) {
            // add first topping
            targetEl.setAttribute(`topping-physics-${selectedTopping}-object`, {
                model: `#${selectedTopping}`,
                name: selectedTopping,
            });
            addOrRemoveFromToppings(`topping-physics-${selectedTopping}-object`);
            // add multiple topping of the same component instance
            for (let i = 0; i < 3; i++) {
                let comp = `topping-physics-${selectedTopping}-object__${i}`;
                targetEl.setAttribute(comp, {
                    model: `#${selectedTopping}`,
                    name: selectedTopping,
                });
                addOrRemoveFromToppings(comp);
            }
        } else {
            // remove first topping
            targetEl.removeAttribute(`topping-physics-${selectedTopping}-object`);
            addOrRemoveFromToppings(`topping-physics-${selectedTopping}-object`);
            // remove multiple topping of the same component instance
            for (let i = 0; i < 3; i++) {
                targetEl.removeAttribute(
                    `topping-physics-${selectedTopping}-object__${i}`
                );
                addOrRemoveFromToppings(
                    `topping-physics-${selectedTopping}-object__${i}`
                );
            }
        }
    }
};

/*********************************************************
 * @name: orderSalad
 * @desc: on click of mix salad, the bowl is zoomed in to show it is ready
 *********************************************************/

const orderSalad = () => {
    const text3d = document.querySelector('#readyText');
    text3d.setAttribute('position', '-8 8.25 -14');
    const camera = document.querySelector('#camera');
    const cameraRig = document.querySelector('#rig');
    cameraRig.setAttribute(
        'animation',
        'property: position; dur:2000; to: 0 3 -1'
    );
    camera.setAttribute('orbit-controls', 'rotateTo', '0 2 7');
};

/*********************************************************
 * @name: init
 * @desc: fired on initialization
 *********************************************************/

(() => {
    const saladDressingUL = document.querySelector('#salad-dressing-list');
    saladDressingUL.addEventListener('click', addTopping);
})();
