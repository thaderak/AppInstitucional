import { Injectable } from '@angular/core';

export interface EntregaLocal {
  id?: number;
  tareaId: number | null;
  comentario: string;
  usuario: string;
  fechaRegistro?: string;
  estadoSincronizacion?: 'PENDIENTE' | 'SINCRONIZADO';
  curso?: string;
  titulo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'senatiTaskDB';
  private storeName = 'entregas_pendientes';

  async abrirDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB no está disponible en este entorno.'));
        return;
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async guardarEntregaLocal(entrega: any): Promise<void> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const registro: EntregaLocal = {
        ...entrega,
        fechaRegistro: new Date().toISOString(),
        estadoSincronizacion: 'PENDIENTE'
      };
      const request = store.add(registro);
      transaction.oncomplete = () => {
        console.log('✅ Entrega/Observación guardada localmente en IndexedDB');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async obtenerEntregasLocales(): Promise<EntregaLocal[]> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as EntregaLocal[]);
      request.onerror = () => reject(request.error);
    });
  }

  async eliminarEntregaLocal(id: number): Promise<void> {
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async sincronizarTodas(): Promise<number> {
    const entregas = await this.obtenerEntregasLocales();
    const pendientes = entregas.filter(e => e.estadoSincronizacion === 'PENDIENTE');
    const db = await this.abrirDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      for (const item of pendientes) {
        item.estadoSincronizacion = 'SINCRONIZADO';
        store.put(item);
      }
      transaction.oncomplete = () => resolve(pendientes.length);
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
