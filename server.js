import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import multer from 'multer';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data', 'cars.json');
const uploadPath = path.join(__dirname, 'uploads');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'is-autos-local-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 8 }
}));
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));
app.use('/uploads', express.static(uploadPath));

const imageStorage = multer.diskStorage({
  destination: uploadPath,
  filename: (_request, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const uploadImages = multer({
  storage: imageStorage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime'].includes(file.mimetype))
});

const adminUser = process.env.ADMIN_USER || 'isabel';
const adminPassword = process.env.ADMIN_PASSWORD || 'isautos-dev';
const requireAdmin = (request, response, next) => {
  if (request.session.isAdmin) return next();
  response.status(401).json({ error: 'Sessão de administração necessária.' });
};

async function readCars() {
  return JSON.parse(await readFile(dataPath, 'utf8'));
}

app.post('/api/auth/login', (request, response) => {
  const { username, password } = request.body;
  if (username !== adminUser || password !== adminPassword) {
    return response.status(401).json({ error: 'Utilizador ou palavra-passe incorretos.' });
  }
  request.session.isAdmin = true;
  response.json({ username: adminUser });
});

app.get('/api/auth/me', (request, response) => {
  if (!request.session.isAdmin) return response.status(401).json({ authenticated: false });
  response.json({ authenticated: true, username: adminUser });
});

app.post('/api/auth/logout', (request, response) => {
  request.session.destroy(() => response.status(204).end());
});

app.get('/api/cars', async (_request, response) => {
  try {
    const cars = await readCars();
    response.json(cars.filter((car) => car.status === 'available'));
  } catch (error) {
    response.status(500).json({ error: 'Não foi possível carregar as viaturas.' });
  }
});

app.get('/api/cars/:id', async (request, response) => {
  try {
    const cars = await readCars();
    const car = cars.find((item) => item.id === request.params.id);
    if (!car) return response.status(404).json({ error: 'Viatura não encontrada.' });
    response.json(car);
  } catch (error) {
    response.status(500).json({ error: 'Não foi possível carregar a viatura.' });
  }
});

app.get('/api/admin/cars', requireAdmin, async (_request, response) => {
  try { response.json(await readCars()); }
  catch (error) { response.status(500).json({ error: 'Não foi possível carregar as viaturas.' }); }
});

app.post('/api/admin/uploads', requireAdmin, uploadImages.fields([{ name: 'photos' }, { name: 'videos' }]), (request, response) => {
  response.status(201).json({ photos: (request.files.photos || []).map((file) => `/uploads/${file.filename}`), videos: (request.files.videos || []).map((file) => `/uploads/${file.filename}`) });
});

app.post('/api/cars', requireAdmin, async (request, response) => {
  const { brand, name, year, km, fuel, price, image } = request.body;
  if (!brand || !name || !year || !fuel || !price) {
    return response.status(400).json({ error: 'Marca, modelo, ano, combustível e preço são obrigatórios.' });
  }

  try {
    const cars = await readCars();
    const car = {
      id: crypto.randomUUID(), brand, name, version: request.body.version || '', year: Number(year),
      km: km || 'Não indicado', fuel, price: Number(price), image: image || '', badge: '',
      photos: Array.isArray(request.body.photos) ? request.body.photos.filter(Boolean) : (image ? [image] : []),
      description: request.body.description || '', payment: request.body.payment || '', status: 'draft', createdAt: new Date().toISOString()
    };
    cars.push(car);
    await writeFile(dataPath, JSON.stringify(cars, null, 2) + '\n');
    response.status(201).json(car);
  } catch (error) {
    response.status(500).json({ error: 'Não foi possível guardar a viatura.' });
  }
});

app.post('/api/admin/cars', requireAdmin, async (request, response) => {
  const { brand, name, year, km, fuel, price, image, status } = request.body;
  if (!brand || !name || !year || !fuel || !price) {
    return response.status(400).json({ error: 'Marca, modelo, ano, combustível e preço são obrigatórios.' });
  }
  try {
    const cars = await readCars();
    const photos = Array.isArray(request.body.photos) ? request.body.photos.filter(Boolean) : (image ? [image] : []);
    const car = { id: crypto.randomUUID(), vehicleType: request.body.vehicleType || 'car', brand, name, version: request.body.version || '', year: Number(year), km: km || 'Não indicado', fuel, price: Number(price), image: photos[0] || image || '', photos, videos: Array.isArray(request.body.videos) ? request.body.videos : [], description: request.body.description || '', badge: request.body.badge || '', payment: request.body.payment || '', paymentType: request.body.paymentType || '', directEntry: request.body.directEntry || '', directInstallments: request.body.directInstallments || '', directInstallmentValue: request.body.directInstallmentValue || '', directPeriod: request.body.directPeriod || '', bankEntry: request.body.bankEntry || '', bankTerm: request.body.bankTerm || '', bankPayment: request.body.bankPayment || '', bankRate: request.body.bankRate || '', bankInstitution: request.body.bankInstitution || '', status: status || 'draft', createdAt: new Date().toISOString() };
    cars.push(car);
    await writeFile(dataPath, JSON.stringify(cars, null, 2) + '\n');
    response.status(201).json(car);
  } catch (error) { response.status(500).json({ error: 'Não foi possível guardar a viatura.' }); }
});

app.patch('/api/admin/cars/:id', requireAdmin, async (request, response) => {
  try {
    const cars = await readCars();
    const index = cars.findIndex((car) => car.id === request.params.id);
    if (index === -1) return response.status(404).json({ error: 'Viatura não encontrada.' });
    const allowed = ['vehicleType', 'brand', 'name', 'version', 'year', 'km', 'fuel', 'price', 'image', 'photos', 'videos', 'description', 'badge', 'payment', 'paymentType', 'directEntry', 'directInstallments', 'directInstallmentValue', 'directPeriod', 'bankEntry', 'bankTerm', 'bankPayment', 'bankRate', 'bankInstitution', 'status'];
    cars[index] = Object.fromEntries(Object.entries({ ...cars[index], ...request.body }).filter(([key]) => allowed.includes(key) || key === 'id' || key === 'createdAt'));
    if (Array.isArray(cars[index].photos)) cars[index].image = cars[index].photos[0] || '';
    await writeFile(dataPath, JSON.stringify(cars, null, 2) + '\n');
    response.json(cars[index]);
  } catch (error) { response.status(500).json({ error: 'Não foi possível atualizar a viatura.' }); }
});

app.listen(port, () => console.log(`IS Autos disponível em http://localhost:${port}`));
