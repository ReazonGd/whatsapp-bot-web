interface QueueItems<T> {
  value: T;
  id: string;
  onDone: (id: string) => void;
}

// Implementasi Queue menggunakan Array
export default class Queue<T> {
  private items: QueueItems<T>[] = [];

  // Menambahkan item ke belakang queue
  enqueue(item: T, id: string): void {
    this.items.push({
      value: item,
      id,
      onDone: (id) => this.remove(id),
    });
  }

  remove(id: string) {
    this.items = this.items.filter((a) => a.id !== id);
  }
  // Mengeluarkan item dari depan queue
  dequeue(): QueueItems<T> | undefined {
    return this.items.shift();
  }

  // Melihat item di depan tanpa mengeluarkannya
  peek(): QueueItems<T> | undefined {
    return this.items[0];
  }

  // Mengecek apakah queue kosong
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Mendapatkan ukuran queue
  size(): number {
    return this.items.length;
  }

  // Mengosongkan queue
  clear(): void {
    this.items = [];
  }

  // Menampilkan semua item dalam queue
  display(): QueueItems<T>[] {
    return [...this.items];
  }
}
