import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import seed from '../seed/pelanggan.json'
import { load, save } from './persist'

export const usePelangganStore = defineStore('pelanggan', () => {
  const list = ref(load('cs_pelanggan', seed))
  watch(list, v => save('cs_pelanggan', v), { deep: true })

  const cari = id => list.value.find(p => p.id === id) || null

  // return pesan error (string) atau null jika sukses
  function validasi(d, idSendiri = null) {
    if (!d.nama) return 'Nama pelanggan wajib diisi'
    if (d.nama.length > 60) return 'Nama maksimal 60 karakter'
    if (!/^\+?\d{8,15}$/.test(d.telepon)) return 'Nomor telepon harus 8-15 digit angka'
    if (list.value.some(p => p.telepon === d.telepon && p.id !== idSendiri)) return 'Nomor telepon sudah terdaftar'
    return null
  }
  function add(d) {
    const err = validasi(d)
    if (err) return err
    list.value.unshift({ ...d, id: Date.now(), dibuat: new Date().toISOString() })
    return null
  }
  function update(id, d) {
    const err = validasi(d, id)
    if (err) return err
    const i = list.value.findIndex(p => p.id === id)
    if (i > -1) list.value[i] = { ...list.value[i], ...d }
    return null
  }
  const remove = id => { list.value = list.value.filter(p => p.id !== id) }
  return { list, cari, add, update, remove }
})
