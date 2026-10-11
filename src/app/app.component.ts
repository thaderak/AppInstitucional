import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService, Tarea } from './services/tarea.service';
import { StorageService, EntregaLocal } from './services/storage.service';

export interface CursoInstructor {
  nombre: string;
  pendientes: number;
  codigo: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  online: boolean = true;
  rolActual: 'Estudiante' | 'Instructor' = 'Estudiante';
  tabActiva: 'tareas' | 'entregas' | 'perfil' = 'tareas';

  private tareaService = inject(TareaService);
  private storageService = inject(StorageService);

  // Datos para vista Estudiante
  listaTareas: Tarea[] = [];
  tareaSeleccionadaId: number | null = null;

  // Datos para vista Instructor
  cursosInstructor: CursoInstructor[] = [
    { nombre: 'Software PWA', pendientes: 12, codigo: 'PWA-202' },
    { nombre: 'Desarrollo PWA', pendientes: 15, codigo: 'PWA-101' },
    { nombre: 'Base de Datos Avanzada', pendientes: 17, codigo: 'BDA-301' },
    { nombre: 'IA Aplicada', pendientes: 10, codigo: 'IAA-401' }
  ];
  cursoSeleccionadoInstructor: string = 'Software PWA';
  nombreTareaInstructor: string = '';

  // Formulario y retroalimentación
  comentarioEntrega: string = '';
  notificacionMensaje: string = '';
  tipoNotificacion: 'success' | 'offline' | 'info' = 'info';

  // Persistencia local en IndexedDB
  entregasLocales: EntregaLocal[] = [];
  sincronizando: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.online = true;
        this.notificacionMensaje = 'Conexión restablecida con el servidor SENATI. Listo para sincronizar.';
        this.tipoNotificacion = 'info';
        this.cargarEntregasLocales();
      });
      window.addEventListener('offline', () => {
        this.online = false;
        this.notificacionMensaje = 'Modo Sin Conexión activado (Offline-First). Guardando en IndexedDB.';
        this.tipoNotificacion = 'offline';
      });
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.online = navigator.onLine;
      this.cargarEntregasLocales();
    }
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.tareaService.obtenerTareas().subscribe({
      next: (data) => {
        this.listaTareas = data;
        if (data.length > 0) {
          this.tareaSeleccionadaId = data[0].id;
        }
      },
      error: (err) => console.error('Error al recuperar tareas desde Service Worker/Cache:', err)
    });
  }

  async cargarEntregasLocales(): Promise<void> {
    try {
      this.entregasLocales = await this.storageService.obtenerEntregasLocales();
    } catch (err) {
      console.warn('No se pudieron cargar entregas locales aún:', err);
    }
  }

  seleccionarTarea(id: number): void {
    this.tareaSeleccionadaId = id;
  }

  seleccionarCursoInstructor(curso: CursoInstructor): void {
    this.cursoSeleccionadoInstructor = curso.nombre;
    this.nombreTareaInstructor = `Evaluación ${curso.nombre}`;
  }

  get tareaSeleccionada(): Tarea | undefined {
    return this.listaTareas.find((t) => t.id === this.tareaSeleccionadaId);
  }

  get cantidadPendientes(): number {
    return this.entregasLocales.filter((e) => e.estadoSincronizacion === 'PENDIENTE').length;
  }

  async enviarEntrega(): Promise<void> {
    if (!this.comentarioEntrega.trim()) return;

    let entregaData: EntregaLocal;

    if (this.rolActual === 'Estudiante') {
      const tarea = this.tareaSeleccionada;
      entregaData = {
        tareaId: this.tareaSeleccionadaId,
        curso: tarea?.curso || 'Curso PWA General',
        titulo: tarea?.titulo || 'Tarea Académica',
        comentario: this.comentarioEntrega,
        usuario: 'Estudiante SENATI'
      };
    } else {
      entregaData = {
        tareaId: this.tareaSeleccionadaId || 0,
        curso: this.cursoSeleccionadoInstructor,
        titulo: this.nombreTareaInstructor || 'Observación Local de Taller',
        comentario: this.comentarioEntrega,
        usuario: 'Instructor SENATI'
      };
    }

    if (this.online) {
      // Simulación de envío exitoso al servidor institucional
      this.notificacionMensaje = 'Entrega enviada exitosamente al servidor del Campus Virtual.';
      this.tipoNotificacion = 'success';
    } else {
      // Persistencia transaccional Offline-First con IndexedDB
      await this.storageService.guardarEntregaLocal(entregaData);
      this.notificacionMensaje = 'Sin Conexión: Registro guardado en el dispositivo (IndexedDB). Estado: PENDIENTE';
      this.tipoNotificacion = 'offline';
      await this.cargarEntregasLocales();
    }

    this.comentarioEntrega = '';
    if (this.rolActual === 'Instructor') {
      this.nombreTareaInstructor = '';
    }
  }

  async sincronizarPendientes(): Promise<void> {
    if (!this.online) {
      this.notificacionMensaje = 'No hay conexión disponible para sincronizar.';
      this.tipoNotificacion = 'offline';
      return;
    }
    this.sincronizando = true;
    try {
      const cantidad = await this.storageService.sincronizarTodas();
      await this.cargarEntregasLocales();
      this.notificacionMensaje = `Se sincronizaron exitosamente ${cantidad} registros con el Campus Virtual.`;
      this.tipoNotificacion = 'success';
    } catch (error) {
      this.notificacionMensaje = 'Error al sincronizar registros locales.';
      this.tipoNotificacion = 'offline';
    } finally {
      this.sincronizando = false;
    }
  }

  cambiarRol(nuevoRol: 'Estudiante' | 'Instructor'): void {
    this.rolActual = nuevoRol;
  }

  alternarModoSimulado(): void {
    this.online = !this.online;
    if (this.online) {
      this.notificacionMensaje = 'Simulación: Conectado a la red institucional de SENATI.';
      this.tipoNotificacion = 'info';
    } else {
      this.notificacionMensaje = 'Simulación: Modo Sin Conexión (Offline-First activado).';
      this.tipoNotificacion = 'offline';
    }
  }

  limpiarNotificacion(): void {
    this.notificacionMensaje = '';
  }
}
