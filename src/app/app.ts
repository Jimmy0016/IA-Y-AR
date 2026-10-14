import { Component, signal, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface Correccion {
  original: string;
  corregida: string;
  explicacion: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  @ViewChild('arCanvas') arCanvas?: ElementRef<HTMLCanvasElement>;

  texto = signal('');
  correcciones = signal<Correccion[]>([]);
  cargando = signal(false);
  fase = signal<null | 'errores' | 'ok'>(null);
  errorMsg = signal('');

  private renderer?: THREE.WebGLRenderer;
  private animFrameId?: number;

  constructor(private cdr: ChangeDetectorRef) {}

  onTextoChange(valor: string) {
    this.texto.set(valor);
    if (this.fase() !== null) {
      this.fase.set(null);
      this.correcciones.set([]);
      this.errorMsg.set('');
      this.destruirAR();
    }
  }

  private extraerJSON(raw: string): Correccion[] {
    // Quitar markdown ```json ... ```
    const limpio = raw.replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1').trim();
    const match = limpio.match(/\{[\s\S]*"errores"[\s\S]*\}/);
    if (!match) return [];
    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed.errores) ? parsed.errores : [];
    } catch {
      return [];
    }
  }

  async verificarTexto() {
    const t = this.texto().trim();
    if (!t) return;

    this.cargando.set(true);
    this.fase.set(null);
    this.correcciones.set([]);
    this.errorMsg.set('');
    this.destruirAR();

    try {
      const prompt =
        'Eres un corrector ortográfico de español estricto. ' +
        'Tu ÚNICA tarea es detectar palabras con letras INCORRECTAS o CAMBIADAS (por ejemplo: "parke" en vez de "parque", "aver" en vez de "haber", "berde" en vez de "verde"). ' +
        'NUNCA marques como error: tildes/acentos faltantes, mayúsculas, puntuación, gramática ni palabras correctamente escritas aunque les falte tilde. ' +
        'Responde ÚNICAMENTE con JSON sin texto extra ni markdown. ' +
        'Formato: {"errores":[{"original":"palabra_mal_escrita","corregida":"palabra_correcta","explicacion":"motivo breve"}]} ' +
        'Si no hay palabras mal escritas responde exactamente: {"errores":[]} ' +
        `Texto a revisar: "${t}"`;

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt,
          stream: false,
          options: { temperature: 0 }
        })
      });

      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

      const data = await res.json();
      const rawText: string = data.response ?? '{"errores":[]}';

      console.log('Respuesta Ollama:', rawText);

      const errores = this.extraerJSON(rawText);
      console.log('Errores detectados:', errores);

      this.correcciones.set(errores);

      if (errores.length > 0) {
        this.fase.set('errores');
      } else {
        this.fase.set('ok');
        this.cdr.detectChanges();
        requestAnimationFrame(() => requestAnimationFrame(() => this.iniciarAR()));
      }
    } catch (e: any) {
      console.error(e);
      this.errorMsg.set('No se pudo conectar con Ollama. Asegúrate de que esté corriendo.');
    } finally {
      this.cargando.set(false);
    }
  }

  iniciarAR() {
    const canvas = this.arCanvas?.nativeElement;
    if (!canvas) return;
    this.destruirAR();

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.5, 5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const luz = new THREE.DirectionalLight(0xff80ff, 2);
    luz.position.set(3, 5, 3);
    scene.add(luz);
    const luz2 = new THREE.DirectionalLight(0xffb6c1, 1);
    luz2.position.set(-3, 2, -2);
    scene.add(luz2);

    const oro = new THREE.MeshStandardMaterial({ color: 0xc77dff, metalness: 0.9, roughness: 0.15 });
    const trofeo = new THREE.Group();

    const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.4, 1.4, 32, 1, true), oro);
    copa.position.y = 1.2;
    trofeo.add(copa);

    const tapa = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), oro);
    tapa.rotation.x = -Math.PI / 2;
    tapa.position.y = 1.9;
    trofeo.add(tapa);

    const tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16), oro);
    tallo.position.y = 0.4;
    trofeo.add(tallo);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.25, 32), oro);
    base.position.y = 0;
    trofeo.add(base);

    const asaGeo = new THREE.TorusGeometry(0.35, 0.07, 8, 20, Math.PI);
    const asaL = new THREE.Mesh(asaGeo, oro);
    asaL.position.set(-1.0, 1.4, 0);
    asaL.rotation.y = Math.PI / 2;
    trofeo.add(asaL);
    const asaR = new THREE.Mesh(asaGeo, oro);
    asaR.position.set(1.0, 1.4, 0);
    asaR.rotation.y = -Math.PI / 2;
    trofeo.add(asaR);

    const matEstrella = new THREE.MeshStandardMaterial({ color: 0xffb6c1, metalness: 1, roughness: 0.1, emissive: 0xff80ff, emissiveIntensity: 0.7 });
    const estrella = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), matEstrella);
    estrella.position.y = 2.35;
    trofeo.add(estrella);

    trofeo.position.y = -0.5;
    scene.add(trofeo);

    const posArr: number[] = [], colArr: number[] = [];
    for (let i = 0; i < 150; i++) {
      posArr.push((Math.random() - 0.5) * 6, Math.random() * 5, (Math.random() - 0.5) * 3);
      colArr.push(Math.random(), Math.random(), Math.random());
    }
    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    cGeo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3));
    const confetti = new THREE.Points(cGeo, new THREE.PointsMaterial({ size: 0.13, vertexColors: true }));
    scene.add(confetti);

    let tick = 0;
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      tick += 0.02;
      trofeo.rotation.y = tick;
      estrella.rotation.x = tick * 1.5;
      estrella.rotation.z = tick;
      const p = confetti.geometry.attributes['position'];
      for (let i = 1; i < p.count * 3; i += 3) {
        (p.array as Float32Array)[i] -= 0.02;
        if ((p.array as Float32Array)[i] < -2) (p.array as Float32Array)[i] = 4;
      }
      p.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();
  }

  destruirAR() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.renderer?.dispose();
    this.renderer = undefined;
  }

  ngOnDestroy() { this.destruirAR(); }
}
