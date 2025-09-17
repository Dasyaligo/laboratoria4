const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
        max: 20, // максимальное количество клиентов
    idleTimeoutMillis: 30000, // закрыть простаивающие клиенты через 30 секунд
    connectionTimeoutMillis: 2000
});

// Проверка подключения
pool.on('connect', () => {
    console.log('✅ Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
    console.error('❌ Ошибка подключения к PostgreSQL:', err);
});

// Middleware для аутентификации
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Неверный токен' });
        }
        req.user = user;
        next();
    });
};

// Тестовые endpoints
app.get('/api/test', (req, res) => {
    res.json({ message: 'API работает!', timestamp: new Date() });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({ 
            message: 'Подключение к БД работает!',
            current_time: result.rows[0].current_time
        });
    } catch (error) {
        console.error('Ошибка теста БД:', error);
        res.status(500).json({ error: error.message });
    }
});

// Auth endpoints
// Исправленная регистрация
app.post('/api/auth/register', async (req, res) => {
    console.log('🔵 REGISTER REQUEST:', req.body);
    
    try {
        const { full_name, email, password, phone, default_address } = req.body;
        
        // Быстрая валидация
        if (!full_name || !email || !password) {
            return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
        }

        // Проверяем email на существование
        const userCheck = await pool.query(
            'SELECT user_id FROM users WHERE email = $1',
            [email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Оптимизированное хеширование (меньше saltRounds)
        const hashedPassword = await bcrypt.hash(password, 8); // вместо 10

        // Создаем пользователя
        const result = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, phone, default_address)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING user_id, full_name, email, phone, default_address`,
            [full_name, email, hashedPassword, phone, default_address]
        );

        const newUser = result.rows[0];

        // Быстрая генерация токена
        const token = jwt.sign(
            { userId: newUser.user_id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('❌ REGISTRATION ERROR:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера при регистрации',
            message: error.message
        });
    }
});

// Исправленная верификация токена
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        valid: true, 
        user: req.user 
    });
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                default_address: user.default_address
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Flights endpoints
app.get('/api/flights', async (req, res) => {
    try {
        const { origin, destination, minPrice, maxPrice, airline } = req.query;
        
        let query = `
            SELECT 
                flight_id,
                origin,
                destination,
                departure_date,
                arrival_date,
                airline,
                price,
                duration,
                available_seats,
                description
            FROM flights 
            WHERE available_seats > 0
        `;
        
        const params = [];
        let paramCount = 0;

        if (origin) {
            paramCount++;
            query += ` AND origin ILIKE $${paramCount}`;
            params.push(`%${origin}%`);
        }
        if (destination) {
            paramCount++;
            query += ` AND destination ILIKE $${paramCount}`;
            params.push(`%${destination}%`);
        }
        if (minPrice) {
            paramCount++;
            query += ` AND price >= $${paramCount}`;
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            paramCount++;
            query += ` AND price <= $${paramCount}`;
            params.push(parseFloat(maxPrice));
        }
        if (airline) {
            paramCount++;
            query += ` AND airline ILIKE $${paramCount}`;
            params.push(`%${airline}%`);
        }

        query += ' ORDER BY departure_date ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Flights error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Cart endpoints
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, f.origin, f.destination, f.airline, f.departure_date, f.price
             FROM cart c
             JOIN flights f ON c.flight_id = f.flight_id
             WHERE c.user_id = $1`,
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const { flight_id, passengers_count } = req.body;
        
        // Проверяем, есть ли уже этот рейс в корзине
        const existingItem = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1 AND flight_id = $2',
            [req.user.userId, flight_id]
        );

        if (existingItem.rows.length > 0) {
            // Обновляем количество
            const result = await pool.query(
                `UPDATE cart SET passengers_count = passengers_count + $1
                 WHERE user_id = $2 AND flight_id = $3
                 RETURNING *`,
                [passengers_count, req.user.userId, flight_id]
            );
            res.json(result.rows[0]);
        } else {
            // Добавляем новый элемент
            const result = await pool.query(
                `INSERT INTO cart (user_id, flight_id, passengers_count)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [req.user.userId, flight_id, passengers_count || 1]
            );
            res.status(201).json(result.rows[0]);
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/cart/:flight_id', authenticateToken, async (req, res) => {
    try {
        const { flight_id } = req.params;
        
        await pool.query(
            'DELETE FROM cart WHERE user_id = $1 AND flight_id = $2',
            [req.user.userId, flight_id]
        );
        
        res.json({ message: 'Элемент удален из корзины' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM cart WHERE user_id = $1',
            [req.user.userId]
        );
        
        res.json({ message: 'Корзина очищена' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Orders endpoints
app.post('/api/orders', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { delivery_address, delivery_date, cart_items, total_amount } = req.body;
        
        // Создаем заказ
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total_amount, delivery_address, delivery_date, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING *`,
            [req.user.userId, total_amount, delivery_address, delivery_date]
        );

        const order = orderResult.rows[0];

        // Создаем appointments для каждого элемента корзины
        for (const item of cart_items) {
            await client.query(
                `INSERT INTO appointments (order_id, flight_id, user_id, passengers_count, status)
                 VALUES ($1, $2, $3, $4, 'booked')`,
                [order.order_id, item.flight_id, req.user.userId, item.passengers_count || item.quantity]
            );

            // Обновляем доступные места
            await client.query(
                `UPDATE flights 
                 SET available_seats = available_seats - $1 
                 WHERE flight_id = $2 AND available_seats >= $1`,
                [item.passengers_count || item.quantity, item.flight_id]
            );
        }

        // Очищаем корзину
        await client.query(
            'DELETE FROM cart WHERE user_id = $1',
            [req.user.userId]
        );

        await client.query('COMMIT');
        
        // Получаем полную информацию о заказе с appointments
        const fullOrderResult = await pool.query(
            `SELECT 
                o.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'appointment_id', a.appointment_id,
                            'flight_id', a.flight_id,
                            'passengers_count', a.passengers_count,
                            'status', a.status
                        )
                    ) FILTER (WHERE a.appointment_id IS NOT NULL),
                    '[]'
                ) as appointments
            FROM orders o
            LEFT JOIN appointments a ON o.order_id = a.order_id
            WHERE o.order_id = $1
            GROUP BY o.order_id`,
            [order.order_id]
        );
        
        res.status(201).json(fullOrderResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Order error:', error);
        res.status(500).json({ error: 'Ошибка при оформлении заказа' });
    } finally {
        client.release();
    }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                o.order_id,
                o.user_id,
                o.total_amount,
                o.status,
                o.delivery_address,
                o.delivery_date,
                o.created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'appointment_id', a.appointment_id,
                            'flight_id', a.flight_id,
                            'passengers_count', a.passengers_count,
                            'status', a.status,
                            'seat_numbers', a.seat_numbers,
                            'boarding_time', a.boarding_time,
                            'special_requests', a.special_requests
                        )
                    ) FILTER (WHERE a.appointment_id IS NOT NULL),
                    '[]'
                ) as appointments
            FROM orders o
            LEFT JOIN appointments a ON o.order_id = a.order_id
            WHERE o.user_id = $1
            GROUP BY o.order_id
            ORDER BY o.created_at DESC`,
            [req.user.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Reviews endpoints
app.get('/api/reviews/:flight_id', async (req, res) => {
    try {
        const { flight_id } = req.params;
        
        const result = await pool.query(
            `SELECT r.*, u.full_name
             FROM reviews r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.flight_id = $1
             ORDER BY r.created_at DESC`,
            [flight_id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Reviews error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
        const { flight_id, rating, comment } = req.body;
        
        // Проверяем, не оставлял ли пользователь уже отзыв на этот рейс
        const existingReview = await pool.query(
            'SELECT * FROM reviews WHERE user_id = $1 AND flight_id = $2',
            [req.user.userId, flight_id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ error: 'Вы уже оставляли отзыв на этот рейс' });
        }

        const result = await pool.query(
            `INSERT INTO reviews (user_id, flight_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.userId, flight_id, rating, comment]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// User profile endpoints
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, full_name, email, phone, default_address, created_at FROM users WHERE user_id = $1',
            [req.user.userId]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { full_name, phone, default_address } = req.body;
        
        const result = await pool.query(
            `UPDATE users 
             SET full_name = $1, phone = $2, default_address = $3
             WHERE user_id = $4
             RETURNING user_id, full_name, email, phone, default_address`,
            [full_name, phone, default_address, req.user.userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Проверяем текущий пароль
        const userResult = await pool.query(
            'SELECT password_hash FROM users WHERE user_id = $1',
            [req.user.userId]
        );

        const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        
        if (!validPassword) {
            return res.status(400).json({ error: 'Текущий пароль неверен' });
        }

        // Обновляем пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE user_id = $2',
            [hashedPassword, req.user.userId]
        );

        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log('📊 Тестовые endpoints:');
    console.log(`1) http://localhost:${PORT}/api/test`);
    console.log(`2) http://localhost:${PORT}/api/test-db`);
    console.log(`3) http://localhost:${PORT}/api/health`);
    console.log('🔐 Auth endpoints:');
    console.log(`- POST http://localhost:${PORT}/api/auth/register`);
    console.log(`- POST http://localhost:${PORT}/api/auth/login`);
    console.log('✈️  Flights endpoints:');
    console.log(`- GET http://localhost:${PORT}/api/flights`);
});