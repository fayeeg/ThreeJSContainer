import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import * as OrbitControls from 'three-orbitcontrols';
import * as THREE from 'three';
import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader';
import * as TWEEN from '@tweenjs/tween.js';
import { Color } from 'three';
import { TouchSequence } from 'selenium-webdriver';

@Component({
  selector: 'app-myfirstscene',
  templateUrl: './myfirstscene.component.html',
  styleUrls: ['./myfirstscene.component.css']
})

export class MyfirstsceneComponent implements OnInit, AfterViewInit {
  private container: HTMLElement;
  @ViewChild('container') elementRef: ElementRef;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private mtlLoader: MTLLoader;
  private loader: OBJLoader;
  public objects = [];
  public objectMaterials = THREE.Material;
  public container_object: THREE.Object3D;
  private position: any;
  DURATION = 100;
  DEFAULT_CAMERA_POSITION = 800;
  DEFAULT_CONTAINER_SIZE = 40;
  CONSTANT_DISTANCE = 250;
  MAX_DISTANCE = 1350;
  MIN_DISTANCE = 650;
  minWheel = 0;
  maxWheel = 70;
  SCALE_RATIO = {
    z: 0.949,
    x: {
      size20: 1.02,
      size40: 1.89,
    }
  };


  FACE_MASKS = {
    FRONT: 0x01,
    BACK: 0x02,
    LEFT: 0x04,
    RIGHT: 0x08,
    TOP: 0x10,
    BOTTOM: 0x12
  };

  constructor() { }

  ngOnInit() {
    this.container = this.elementRef.nativeElement;
    this.init();
    this.animate();
    // this.show_container_side(this.FACE_MASKS.FRONT);
    this.show_container_side(this.FACE_MASKS.FRONT);
  }

  ngAfterViewInit() {

  }

  init() {
    const screen = {
      width: 800,
      height: 600
    },
      view = {
        angle: 45,
        aspect: screen.width / screen.height,
        near: 0.1,
        far: 1000
      };


    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.x = 1000;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#EEEEEE');
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.01);
    this.scene.add( ambientLight );
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    this.camera.add(pointLight);
    this.scene.add(this.camera);


    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.mtlLoader = new MTLLoader();
    this.loader = new OBJLoader();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xEEEEEE);

    this.container.appendChild(this.renderer.domElement);

    // group
    const group = new THREE.Group();
    this.scene.add(group);



    this.loader
      .setPath('assets/models/')
      .load('ContainerOBJ.obj', (object) => {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        group.add(object);
        object.scale.z = 0.949;
        object.scale.x = 1;
        this.container_object = object;

        const size = new THREE.Vector3();
        const box = new THREE.Box3().setFromObject(this.container_object); // AABB
        box.getSize(size);

        const geometry = new THREE.BoxBufferGeometry(size.x, size.y, size.z, 5, 4);

        const gridGeometry = this.GridBoxGeometry(geometry, false);

        const grid = new THREE.LineSegments(gridGeometry, new THREE.LineBasicMaterial({
          color: 'aqua'
        }));

        group.add(grid);


      });

    this.addControls();

  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  public addControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

    this.controls.enablePan = false;
    this.controls.addEventListener('change', this.render.bind(this));

  }

 public GridBoxGeometry(geometry, independent) {

    if (!(geometry instanceof THREE.BoxBufferGeometry)) {
    console.log('GridBoxGeometry: the parameter \'geometry\' has to be of the type THREE.BoxBufferGeometry');
    return geometry;
    }
    independent = independent !== undefined ? independent : false;

    const newGeometry = new THREE.BoxBufferGeometry();
    this.position = geometry.attributes.position;
    // newGeometry.attributes.position = independent === false ? position : position.clone();
    newGeometry.attributes.position = this.position;
    const segmentsX = geometry.parameters.widthSegments || 1;
    const segmentsY = geometry.parameters.heightSegments || 1;
    const segmentsZ = geometry.parameters.depthSegments || 1;

    let startIndex = 0;
    const indexSide1 = indexSide(segmentsZ, segmentsY, startIndex);
    startIndex += (segmentsZ + 1) * (segmentsY + 1);
    const indexSide2 = indexSide(segmentsZ, segmentsY, startIndex);
    startIndex += (segmentsZ + 1) * (segmentsY + 1);
    const indexSide3 = indexSide(segmentsX, segmentsZ, startIndex);
    startIndex += (segmentsX + 1) * (segmentsZ + 1);
    const indexSide4 = indexSide(segmentsX, segmentsZ, startIndex);
    startIndex += (segmentsX + 1) * (segmentsZ + 1);
    const indexSide5 = indexSide(segmentsX, segmentsY, startIndex);
    startIndex += (segmentsX + 1) * (segmentsY + 1);
    const indexSide6 = indexSide(segmentsX, segmentsY, startIndex);

    let fullIndices = [];
    fullIndices = fullIndices.concat(indexSide1);
    fullIndices = fullIndices.concat(indexSide2);
    fullIndices = fullIndices.concat(indexSide3);
    fullIndices = fullIndices.concat(indexSide4);
    fullIndices = fullIndices.concat(indexSide5);
    fullIndices = fullIndices.concat(indexSide6);

    newGeometry.setIndex(fullIndices);

    function indexSide(x, y, shift) {
      const indices = [];
      for (let i = 0; i < y + 1; i++) {
        let index11 = 0;
        let index12 = 0;
        for (let j = 0; j < x; j++) {
        index11 = (x + 1) * i + j;
        index12 = index11 + 1;
        const index21 = index11;
        const index22 = index11 + (x + 1);
        indices.push(shift + index11, shift + index12);
        if (index22 < ((x + 1) * (y + 1) - 1)) {
          indices.push(shift + index21, shift + index22);
        }
        }
        if ((index12 + x + 1) <= ((x + 1) * (y + 1) - 1)) {
        indices.push(shift + index12, shift + index12 + x + 1);
        }
      }
      return indices;
    }
    return newGeometry;
  }

  @HostListener('document:keypress', ['$event'])
  public onKeyPress(event: KeyboardEvent) {
    console.log('onKeyPress: ' + event.key);
  }
  @HostListener('document:mousedown', ['$event'])
  public onMouseDown(event: MouseEvent) {
    console.log('onMouseDown');
    event.preventDefault();
  }

  private findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
    // NOTE: Better to keep separate array of selected objects
    if (parent.children.length > 0) {
      parent.children.forEach((i) => {
        pred.push(i);
        this.findAllObjects(pred, i);
      });
    }
  }

  public onMouseUp(event: MouseEvent) {
    console.log('onMouseUp');
  }



  animate() {
    TWEEN.update();
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.render();

  }

  createMesh() {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const cubeA = new THREE.Mesh(geometry, material);
    cubeA.position.set(100, 100, 0);

    const cubeB = new THREE.Mesh(geometry, material);
    cubeB.position.set(-100, -100, 0);

    // create a group and add the two cubes
    // These cubes can now be rotated / scaled etc as a group
    const group = new THREE.Group();
    group.add(cubeA);
    group.add(cubeB);

    this.scene.add(group);
  }

  show_container_side(side) {
    // document.getElementById('dismiss-button').style.display = 'block';
    const face_vector = { x: 0, y: 0, z: 0 };
    switch (side) {
      case this.FACE_MASKS.LEFT:
        face_vector.z = 1;
        break;
      case this.FACE_MASKS.RIGHT:
        face_vector.z = -1;
        break;
      case this.FACE_MASKS.BACK:
        face_vector.x = -1;
        break;
      case this.FACE_MASKS.FRONT:
        face_vector.x = 1;
        break;
      case this.FACE_MASKS.TOP:
        face_vector.y = 1;
        break;
      case this.FACE_MASKS.BOTTOM:
        face_vector.y = -1;
        break;
    }
    const selected_side_vector = face_vector;
    console.log('selected side of the vector' + face_vector + ' side ' + side);
    const current_pos = { x: this.controls.object.position.x, y: this.controls.object.position.y, z: this.controls.object.position.z };
    const target_pos = {
      x: face_vector.x * this.DEFAULT_CAMERA_POSITION, y: face_vector.y * this.DEFAULT_CAMERA_POSITION,
      z: face_vector.z * this.DEFAULT_CAMERA_POSITION
    };
    const tween = this.get_rotation_tween(current_pos, target_pos, this.DURATION);
    // this.controls.disableAutoRotate();

    if (this.controls.AutoRotate) {
      this.controls.autoRotate = false;
    }
    tween.start();

    // const event = new CustomEvent('show_option_panel', {detail: side} );
    // (document)[0].dispatchEvent( event );
    console.log('showing ' + side);

  }

  get_rotation_tween(current, target, duration_time) {
    const tween = new TWEEN.Tween(current).to(target, duration_time);
    tween.easing(TWEEN.Easing.Quartic.Out);
    tween.onUpdate(() => {
    this.controls.object.position.set(current.x, current.y, current.z);
    });
    return tween;
  }




}
