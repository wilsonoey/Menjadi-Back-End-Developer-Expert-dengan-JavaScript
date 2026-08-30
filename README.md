# Menjadi Back-End Developer Expert dengan JavaScript


## Deskripsi Singkat Studi Kasus Forum API
Garuda Game (perusahaan fiktif) merupakan sebuah perusahaan paling sukses dalam menjalankan bisnis di bidang online game. Perusahaan tersebut memiliki ratusan game yang dimainkan oleh jutaan pengguna di seluruh dunia. Salah satu kunci keberhasilan Garuda Game adalah dekat dengan para pemainnya. Mereka berhasil membangun komunitas yang aktif.

Untuk menjaga kualitas layanan terhadap komunitas, Garuda Game berinisiatif untuk membangun aplikasi diskusi atau forum untuk para pemain. Dengan hadirnya platform diskusi yang resmi, para pemain akan sangat terbantu dan merasa nyaman untuk berdiskusi perihal game yang mereka mainkan. Aplikasi forum akan tersedia di platform web ataupun mobile native.

Garuda Game ingin aplikasi forum didesain secara matang. Seperti menerapkan automation testing, menerapkan clean architecture. Dengan begitu, aplikasi ini bisa terhindar dari bug, mudah beradaptasi pada perubahan teknologi, dan mudah untuk dikembangkan.

Untuk mencapai itu, Garuda Game menghadirkan talenta terbaik dalam membangun aplikasi forum. Salah satunya adalah Anda yang ditugaskan untuk membangun Back-End API guna mendukung fungsionalitas dari aplikasi Front-End.

Aplikasi forum dikembangkan secara bertahap dan saat ini diharapkan sudah memiliki fitur:

- Registrasi Pengguna
- Login dan Logout
- Menambahkan Thread
- Melihat Thread
- Menambahkan dan Menghapus Komentar pada Thread
- Menambahkan dan Menghapus Balasan Komentar Thread (opsional)


## Durasi Proyek
- Submission 1: 03 Maret 2022 - 21 September 2025
- Submission 2: 22 September 2025 - 30 Agustus 2026

## Software Architecture
### Tech Stack
- Express untuk server backend
- PostgreSQL untuk menyimpan data ke database menggunakan Clever Cloud (Free Tier)
- Jest untuk automation testing
- Sequelize untuk ORM

### Package yang digunakan
| Name                      | Version    | Package Type        |
|---------------------------|------------|---------------------|
| bcrypt                    | v6.0.0     | Dependencies        |
| dotenv                    | v17.4.2    | Dependencies        |
| express                   | v5.2.1     | Dependencies        |
| express-rate-limit        | v8.7.0     | Dependencies        |
| instances-container       | v2.0.6     | Dependencies        |
| jsonwebtoken              | v9.0.3     | Dependencies        |
| nanoid                    | v3.3.18    | Dependencies        |
| pg                        | v8.23.0    | Dependencies        |
| pg-hstore                 | v2.3.4     | Dependencies        |
| sequelize                 | v6.37.8    | Dependencies        |
| supertest                 | v7.2.2     | Dependencies        |
| @types/jest               | v30.0.0    | DevDependencies     |
| eslint                    | v8.57.1    | DevDependencies     |
| eslint-config-airbnb-base | v15.0.0    | DevDependencies     |
| eslint-plugin-import      | v2.32.0    | DevDependencies     |
| jest                      | v30.5.0    | DevDependencies     |
| node-pg-migrate           | v9.0.0     | DevDependencies     |
| nodemon                   | v3.1.14    | DevDependencies     |


## Cara Menjalankan Aplikasi
1. Setelah menginstall NodeJS versi v20.x LTS, silakan install package menggunakan perintah berikut:

```bash
npm install
```

2. Lakukan migrasi database menggunakan perintah berikut :

```bash
npm run migrate
```

Gunakan perintah:

```bash
npm run migrate:test
```

untuk menjalankan migrasi database untuk testing.

3. Silakan jalankan server menggunakan perintah berikut :

```bash
npm start
```

jika menjalankan server tanpa mencetak setiap hasil konsole ke file error.txt, atau :

```bash
npm run start:dev
```

jika menjalankan server dengan mencetak setiap hasil konsole ke file error.txt

4. Jika ingin menjalankan automation testing, silakan gunakan perintah berikut :

```bash
npm run test
```

Jika menjalankan automation testing dengan urutan tertentu gunakan perintah berikut :

```bash
npm test:order
```

Jika ingin menjalankan automation testing dengan mode watch, silakan gunakan perintah berikut :

```bash
npm run test:watch
```