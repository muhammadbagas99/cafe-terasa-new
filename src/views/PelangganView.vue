<script setup>
import { ref, computed } from 'vue'
import { usePelangganStore } from '../stores/pelanggan'
import { useTransaksiStore } from '../stores/transaksi'
import { useAuthStore } from '../stores/auth'
import { rp, tgl } from '../utils/format'
import BaseTable from '../components/common/BaseTable.vue'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'

const pel = usePelangganStore(); const trx = useTransaksiStore(); const auth = useAuthStore()
const cols = [
  { key: 'nama', label: 'Nama' }, { key: 'telepon', label: 'Telepon' }, { key: 'catatan', label: 'Catatan' },
  { key: 'jumlah', label: 'Transaksi' }, { key: 'belanja', label: 'Total Belanja' }, { key: 'aksi', label: 'Aksi' }
]
const q = ref(''); const show = ref(false); const editId = ref(null); const err = ref('')
const form = ref({ nama: '', telepon: '', catatan: '' })

// ringkasan belanja per pelanggan dihitung dari riwayat transaksi
const ringkas = computed(() => {
  const m = {}
  for (const t of trx.list) {
    if (!t.pelangganId) continue
    const r = (m[t.pelangganId] ||= { jumlah: 0, belanja: 0, terakhir: t.tanggal })
    r.jumlah++; r.belanja += t.total
    if (t.tanggal > r.terakhir) r.terakhir = t.tanggal
  }
  return m
})
const rows = computed(() => {
  const k = q.value.trim().toLowerCase()
  return pel.list
    .filter(p => !k || p.nama.toLowerCase().includes(k) || p.telepon.includes(k))
    .map(p => ({ ...p, ...(ringkas.value[p.id] || { jumlah: 0, belanja: 0, terakhir: null }) }))
})

function buka(p) {
  editId.value = p?.id ?? null; err.value = ''
  form.value = p ? { nama: p.nama, telepon: p.telepon, catatan: p.catatan } : { nama: '', telepon: '', catatan: '' }
  show.value = true
}
function simpan() {
  const d = { nama: form.value.nama.trim(), telepon: form.value.telepon.trim(), catatan: form.value.catatan.trim() }
  err.value = (editId.value ? pel.update(editId.value, d) : pel.add(d)) || ''
  if (!err.value) show.value = false
}
function hapus(p) { if (confirm(`Hapus pelanggan ${p.nama}? Riwayat transaksi tetap tersimpan.`)) pel.remove(p.id) }
</script>

<template>
  <div class="row between">
    <h2>Data Pelanggan</h2>
    <BaseButton @click="buka()">+ Tambah Pelanggan</BaseButton>
  </div>
  <input v-model="q" class="cari" placeholder="Cari nama atau nomor telepon" />
  <BaseTable :columns="cols" :rows="rows">
    <template #catatan="{ row }">{{ row.catatan || '-' }}</template>
    <template #belanja="{ row }">
      {{ rp(row.belanja) }}<br v-if="row.terakhir"><small v-if="row.terakhir">Terakhir {{ tgl(row.terakhir) }}</small>
    </template>
    <template #aksi="{ row }">
      <BaseButton variant="secondary" @click="buka(row)">Ubah</BaseButton>
      <BaseButton v-if="auth.user.role === 'admin'" variant="danger" @click="hapus(row)">Hapus</BaseButton>
    </template>
  </BaseTable>
  <BaseModal :show="show" :title="editId ? 'Ubah Pelanggan' : 'Tambah Pelanggan'" @close="show = false">
    <label>Nama<input v-model="form.nama" maxlength="60" /></label>
    <label>Nomor telepon<input v-model="form.telepon" inputmode="tel" placeholder="08xxxxxxxxxx" /></label>
    <label>Catatan (opsional)<input v-model="form.catatan" /></label>
    <p v-if="err" class="err">{{ err }}</p>
    <div class="row"><BaseButton @click="simpan">Simpan</BaseButton><BaseButton variant="ghost" @click="show = false">Batal</BaseButton></div>
  </BaseModal>
</template>
