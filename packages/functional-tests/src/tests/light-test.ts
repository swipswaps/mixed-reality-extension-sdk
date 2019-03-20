/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

import { Test } from '../test';
import delay from '../utils/delay';

// tslint:disable:no-string-literal

export default class LightTest extends Test {
    public expectedResultDescription = "Different types of lights";
    public async run(): Promise<boolean> {
        // Create scene objects.
        const props = this.createProps();
        const sphere = this.createSphere();

        // Updates the label for the test stage.
        const updateLabel = (lightType: string) => {
            this.app.setOverrideText(`${lightType} Light Test`);
        };

        // Picks a random color.
        const randomColor = (minValue = 0.15) => {
            return new MRE.Color3(
                minValue + Math.random() * (1 - minValue),
                minValue + Math.random() * (1 - minValue),
                minValue + Math.random() * (1 - minValue),
            );
        };

        // Animates the sphere along one side of the scene, with some randomness of final height, and
        // rotating to face the center of the space.
        const animateSide = async (dirX: number, dirZ: number, time: number) => {
            if (!this.stopped) {
                const position = new MRE.Vector3(dirX, 0.5 + 1.5 * Math.random(), dirZ);
                const rotation = MRE.Quaternion.LookAt(
                    position,
                    props['monkey'].transform.position,
                    new MRE.Vector3(0, -Math.PI / 8, 0));
                sphere.light.color = randomColor();
                sphere.animateTo({
                    transform: {
                        position,
                        rotation
                    }
                }, time, MRE.AnimationEaseCurves.EaseInOutSine);
                await delay(time * 1000);
            }
        };

        // One loop of the sphere moving along each side of the scene.
        const animateAround = async (time: number) => {
            await animateSide(1, 0, time / 4);
            await animateSide(-1, 0, time / 4);
            await animateSide(-1, -2, time / 4);
            await animateSide(1, -2, time / 4);
        };

        while (!this.stopped) {
            // Spot Light
            updateLabel('Spot');
            sphere.light.copy({
                type: 'spot',
                spotAngle: Math.PI / 3,
                range: 10,
            });
            await animateAround(5);
            // Point Light
            updateLabel('Point');
            sphere.light.copy({
                type: 'point',
                range: 10,
            });
            await animateAround(5);
        }

        return true;
    }

    private createProps() {
        const props: { [id: string]: MRE.Actor } = {};
        props['monkey'] = MRE.Actor.CreateFromGltf(this.app.context, {
            resourceUrl: `${this.baseUrl}/monkey.glb`,
            actor: {
                transform: {
                    scale: { x: 0.5, y: 0.5, z: 0.5 },
                    position: { y: 1, z: -1 },
                    rotation: {x: 0, y: 1, z: 0, w: 0}, // rotate 180 degrees
                }
            }
        }).value;

        const propWidth = 0.33;
        const propHeight = 0.33;
        props['left-box'] = MRE.Actor.CreatePrimitive(this.app.context, {
            definition: {
                shape: MRE.PrimitiveShape.Box,
                dimensions: { x: propWidth, z: propWidth, y: propHeight }
            },
            actor: {
                transform: {
                    position: { x: 0.5, y: 0.65, z: -1 }
                }
            }
        }).value;
        props['right-box'] = MRE.Actor.CreatePrimitive(this.app.context, {
            definition: {
                shape: MRE.PrimitiveShape.Box,
                dimensions: { x: propWidth, z: propWidth, y: propHeight }
            },
            actor: {
                transform: {
                    position: { x: -0.5, y: 0.65, z: -1 }
                }
            }
        }).value;
        return props;
    }

    private createSphere() {
        return MRE.Actor.CreatePrimitive(this.app.context, {
            definition: {
                shape: MRE.PrimitiveShape.Sphere,
                radius: 0.1
            },
            addCollider: true,
            actor: {
                light: { type: 'spot', intensity: 5 } // Add a light component.
            }
        }).value;
    }
}