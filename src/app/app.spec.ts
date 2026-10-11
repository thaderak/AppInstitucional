import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TareaService } from './services/tarea.service';
import { StorageService } from './services/storage.service';
import { of } from 'rxjs';

describe('AppComponent (SENATI TaskHub PWA)', () => {
  let mockTareaService: Partial<TareaService>;
  let mockStorageService: Partial<StorageService>;

  beforeEach(async () => {
    mockTareaService = {
      obtenerTareas: () =>
        of([
          {
            id: 101,
            curso: 'Desarrollo de Software PWA',
            titulo: 'Entregable 01: Configuración de Service Worker',
            instructor: 'Ing. Jorge Luque',
            fechaEntrega: '2026-10-15',
            estado: 'Pendiente'
          }
        ])
    };

    mockStorageService = {
      abrirDB: async () => ({} as IDBDatabase),
      guardarEntregaLocal: async () => {},
      obtenerEntregasLocales: async () => [],
      eliminarEntregaLocal: async () => {},
      sincronizarTodas: async () => 0
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: TareaService, useValue: mockTareaService },
        { provide: StorageService, useValue: mockStorageService }
      ]
    }).compileComponents();
  });

  it('debe crear la aplicación SENATI TaskHub', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('debe renderizar el título de la PWA institucional', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('SENATI TaskHub PWA');
  });

  it('debe alternar entre el rol de Estudiante e Instructor', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.rolActual).toBe('Estudiante');
    app.cambiarRol('Instructor');
    expect(app.rolActual).toBe('Instructor');
  });

  it('debe conmutar el estado online / offline correctamente', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const estadoInicial = app.online;
    app.alternarModoSimulado();
    expect(app.online).toBe(!estadoInicial);
  });
});
