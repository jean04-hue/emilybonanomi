**\*\*\* CRIAR ARQUIVO CMD \*\*\***

type nul > src\\models\\order.model.js

type nul > src\\services\\order.service.js

type nul > src\\controllers\\order.controller.js

type nul > src\\routes\\order.routes.js



**\*\*\* VISUALIZAR ARQUIVO CMD \*\*\***

type src\\models\\order.model.js





**\*\* CMD BANCO \*\*\***

"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -d emily\_bonanomi



psql -U postgres -d emily\_bonanomi -f "C:\\Users\\schneider.jean\\Emily\_Bonanomi\_v2\\Emily\_Bonanomi\\database\\schema\_completo.sql"



C:\\Users\\schneider.jean\\Emily\_Bonanomi\_v2\\Emily\_Bonanomi





**\*\*\* GERAR TOKEN NOVO \*\*\***

curl -X POST http://localhost:3000/api/auth/login ^

\-H "Content-Type: application/json" ^

\-d "{\\"email\\":\\"admin@emily.com\\",\\"senha\\":\\"43901528Je@n\\"}"



**Pelo Site:** F12 -> Console -> localStorage.getItem('token')

**Teste:** curl http://localhost:3000/api/orders/6 ^

\-H "Authorization: Bearer %TOKEN%"



**\*\*\* SALVAR TOKEN \*\*\***

set TOKEN=COLE\_AQUI\_O\_TOKEN





**\*\*\* CLOUDINARY \*\*\***

Cloud name :dldalhol8

API key: 685555164562554
API secret: yulaJJZXNszK7sS5iYVrYm6OsLQ

