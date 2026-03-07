import * as THREE from "three";

const vertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    float height = vWorldPosition.y;
    float slope = 1.0 - dot(vWorldNormal, vec3(0.0, 1.0, 0.0));

    // Base colors
    vec3 sand = vec3(0.76, 0.70, 0.50);
    vec3 grass = vec3(0.30, 0.55, 0.25);
    vec3 rock = vec3(0.45, 0.40, 0.38);
    vec3 snow = vec3(0.95, 0.95, 0.97);

    // Height-based blending
    float sandWeight = smoothstep(-2.0, 0.5, height) * (1.0 - smoothstep(0.5, 2.0, height));
    float grassWeight = smoothstep(0.0, 2.0, height) * (1.0 - smoothstep(5.0, 8.0, height));
    float rockWeight = smoothstep(4.0, 7.0, height) * (1.0 - smoothstep(10.0, 14.0, height));
    float snowWeight = smoothstep(9.0, 13.0, height);

    // Slope override: steep areas become rock
    float slopeBlend = smoothstep(0.3, 0.6, slope);
    grassWeight *= (1.0 - slopeBlend);
    sandWeight *= (1.0 - slopeBlend);
    snowWeight *= (1.0 - slopeBlend * 0.5);
    rockWeight = mix(rockWeight, 1.0, slopeBlend);

    float totalWeight = sandWeight + grassWeight + rockWeight + snowWeight;
    if (totalWeight > 0.0) {
      sandWeight /= totalWeight;
      grassWeight /= totalWeight;
      rockWeight /= totalWeight;
      snowWeight /= totalWeight;
    }

    vec3 color = sand * sandWeight + grass * grassWeight + rock * rockWeight + snow * snowWeight;

    // Simple directional lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diffuse = max(dot(vWorldNormal, lightDir), 0.0);
    float ambient = 0.3;
    color *= (ambient + diffuse * 0.7);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function createTerrainMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });
}
