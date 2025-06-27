import * as THREE from 'three';

/**
 * 长安城场景构建器
 */
export class ChanganCityBuilder {
  private scene: THREE.Scene;
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * 构建完整的长安城场景
   */
  public buildCity(): THREE.Object3D[] {
    const cityObjects: THREE.Object3D[] = [];

    // 创建地面
    const ground = this.createGround();
    cityObjects.push(ground);

    // 创建主要建筑群
    const buildings = this.createBuildingComplex();
    cityObjects.push(...buildings);

    // 创建装饰元素
    const decorations = this.createDecorations();
    cityObjects.push(...decorations);

    // 创建远山背景
    const mountains = this.createMountains();
    cityObjects.push(...mountains);

    // 添加到场景
    cityObjects.forEach(obj => this.scene.add(obj));

    return cityObjects;
  }

  /**
   * 创建地面
   */
  private createGround(): THREE.Mesh {
    const groundGeometry = new THREE.PlaneGeometry(300, 300, 32, 32);
    
    // 创建地面材质 - 古代石板路效果
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B7355,
      transparent: true,
      opacity: 0.9
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';

    // 添加一些高度变化
    const vertices = ground.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] += Math.random() * 0.2 - 0.1; // Y坐标（高度）
    }
    ground.geometry.attributes.position.needsUpdate = true;
    ground.geometry.computeVertexNormals();

    return ground;
  }

  /**
   * 创建建筑群
   */
  private createBuildingComplex(): THREE.Object3D[] {
    const buildings: THREE.Object3D[] = [];

    // 巍巍高楼 - 主要的高层建筑
    const mainTower = this.createMainTower();
    buildings.push(mainTower);

    // 红楼 - 特色建筑
    const redBuilding = this.createRedBuilding();
    buildings.push(redBuilding);

    // 周围的小建筑
    const surroundingBuildings = this.createSurroundingBuildings();
    buildings.push(...surroundingBuildings);

    // 城墙
    const walls = this.createCityWalls();
    buildings.push(...walls);

    return buildings;
  }

  /**
   * 创建主塔楼
   */
  private createMainTower(): THREE.Group {
    const tower = new THREE.Group();
    tower.name = 'main_tower';

    // 塔基
    const baseGeometry = new THREE.CylinderGeometry(8, 10, 4);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 2;
    base.castShadow = true;
    base.receiveShadow = true;
    tower.add(base);

    // 主体建筑 - 多层
    for (let i = 0; i < 5; i++) {
      const floorHeight = 6;
      const floorRadius = 6 - i * 0.8;
      
      const floorGeometry = new THREE.CylinderGeometry(floorRadius, floorRadius + 0.5, floorHeight);
      const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.1, 0.3, 0.4 + i * 0.1)
      });
      
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.y = 4 + i * floorHeight + floorHeight / 2;
      floor.castShadow = true;
      floor.receiveShadow = true;
      tower.add(floor);

      // 屋檐
      const roofGeometry = new THREE.ConeGeometry(floorRadius + 1, 1.5);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = 4 + i * floorHeight + floorHeight;
      roof.castShadow = true;
      tower.add(roof);
    }

    tower.position.set(-25, 0, -30);
    return tower;
  }

  /**
   * 创建红楼
   */
  private createRedBuilding(): THREE.Group {
    const redBuilding = new THREE.Group();
    redBuilding.name = 'red_building';

    // 主体
    const mainGeometry = new THREE.BoxGeometry(12, 8, 8);
    const mainMaterial = new THREE.MeshLambertMaterial({ color: 0xDC143C });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 4;
    main.castShadow = true;
    main.receiveShadow = true;
    redBuilding.add(main);

    // 屋顶
    const roofGeometry = new THREE.ConeGeometry(8, 3);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9.5;
    roof.castShadow = true;
    redBuilding.add(roof);

    // 柱子
    for (let i = 0; i < 4; i++) {
      const columnGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8);
      const columnMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      
      const angle = (i / 4) * Math.PI * 2;
      column.position.x = Math.cos(angle) * 5;
      column.position.z = Math.sin(angle) * 3;
      column.position.y = 4;
      column.castShadow = true;
      redBuilding.add(column);
    }

    redBuilding.position.set(20, 0, 15);
    return redBuilding;
  }

  /**
   * 创建周围建筑
   */
  private createSurroundingBuildings(): THREE.Object3D[] {
    const buildings: THREE.Object3D[] = [];

    const buildingConfigs = [
      { pos: [-40, 0, 10], size: [6, 10, 6], color: 0xA0522D },
      { pos: [35, 0, -20], size: [8, 12, 8], color: 0xCD853F },
      { pos: [-15, 0, 40], size: [5, 8, 5], color: 0xD2B48C },
      { pos: [45, 0, 30], size: [4, 6, 4], color: 0xDEB887 },
      { pos: [-50, 0, -10], size: [7, 9, 7], color: 0xBC8F8F },
      { pos: [10, 0, -45], size: [6, 11, 6], color: 0xF4A460 }
    ];

    buildingConfigs.forEach((config, index) => {
      const building = this.createSimpleBuilding(
        config.pos[0], config.pos[1], config.pos[2],
        config.size[0], config.size[1], config.size[2],
        config.color
      );
      building.name = `building_${index}`;
      buildings.push(building);
    });

    return buildings;
  }

  /**
   * 创建简单建筑
   */
  private createSimpleBuilding(x: number, y: number, z: number, width: number, height: number, depth: number, color: number): THREE.Group {
    const building = new THREE.Group();

    // 主体
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    building.add(mesh);

    // 屋顶
    const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, height * 0.2);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + height * 0.1;
    roof.castShadow = true;
    building.add(roof);

    building.position.set(x, y, z);
    return building;
  }

  /**
   * 创建城墙
   */
  private createCityWalls(): THREE.Object3D[] {
    const walls: THREE.Object3D[] = [];

    // 创建四面城墙
    const wallConfigs = [
      { pos: [0, 0, -80], size: [160, 8, 4], rotation: 0 },      // 北墙
      { pos: [0, 0, 80], size: [160, 8, 4], rotation: 0 },       // 南墙
      { pos: [-80, 0, 0], size: [160, 8, 4], rotation: Math.PI / 2 }, // 西墙
      { pos: [80, 0, 0], size: [160, 8, 4], rotation: Math.PI / 2 }   // 东墙
    ];

    wallConfigs.forEach((config, index) => {
      const wallGeometry = new THREE.BoxGeometry(config.size[0], config.size[1], config.size[2]);
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      
      wall.position.set(config.pos[0], config.pos[1] + config.size[1] / 2, config.pos[2]);
      wall.rotation.y = config.rotation;
      wall.castShadow = true;
      wall.receiveShadow = true;
      wall.name = `wall_${index}`;
      
      walls.push(wall);
    });

    return walls;
  }

  /**
   * 创建装饰元素
   */
  private createDecorations(): THREE.Object3D[] {
    const decorations: THREE.Object3D[] = [];

    // 创建一些树木
    for (let i = 0; i < 20; i++) {
      const tree = this.createTree();
      tree.position.set(
        (Math.random() - 0.5) * 120,
        0,
        (Math.random() - 0.5) * 120
      );
      tree.name = `tree_${i}`;
      decorations.push(tree);
    }

    // 创建灯笼
    for (let i = 0; i < 10; i++) {
      const lantern = this.createLantern();
      lantern.position.set(
        (Math.random() - 0.5) * 80,
        0,
        (Math.random() - 0.5) * 80
      );
      lantern.name = `lantern_${i}`;
      decorations.push(lantern);
    }

    return decorations;
  }

  /**
   * 创建树木
   */
  private createTree(): THREE.Group {
    const tree = new THREE.Group();

    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // 树冠
    const crownGeometry = new THREE.SphereGeometry(3);
    const crownMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 5;
    crown.castShadow = true;
    tree.add(crown);

    return tree;
  }

  /**
   * 创建灯笼
   */
  private createLantern(): THREE.Group {
    const lantern = new THREE.Group();

    // 灯笼主体
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFF6B35,
      emissive: 0x331100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 3;
    body.castShadow = true;
    lantern.add(body);

    // 支撑杆
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 3;
    pole.castShadow = true;
    lantern.add(pole);

    return lantern;
  }

  /**
   * 创建远山
   */
  private createMountains(): THREE.Object3D[] {
    const mountains: THREE.Object3D[] = [];

    for (let i = 0; i < 8; i++) {
      const mountainGeometry = new THREE.ConeGeometry(
        20 + Math.random() * 15,
        30 + Math.random() * 20
      );
      const mountainMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4682B4,
        transparent: true,
        opacity: 0.6
      });
      
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      
      const angle = (i / 8) * Math.PI * 2;
      const distance = 200 + Math.random() * 50;
      mountain.position.x = Math.cos(angle) * distance;
      mountain.position.z = Math.sin(angle) * distance;
      mountain.position.y = 15;
      mountain.name = `mountain_${i}`;
      
      mountains.push(mountain);
    }

    return mountains;
  }
}
