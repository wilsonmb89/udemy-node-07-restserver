// =============
//    NODEJS PORT
// =============
process.env.PORT = process.env.PORT || 3000;
// ====================
//     ENVIRONMENT
// ====================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
// ====================
//     MONGODB CONNECTION
// ====================
let mongoUrlConnection;
if (process.env.NODE_ENV === 'dev') {
  mongoUrlConnection = 'mongodb://localhost:27017/cafe'
} else {
  const mongodbUser = process.env.MONGODB_USER || '';
  const mongodbPassword = process.env.MONGODB_PASSWORD || '';
  mongoUrlConnection = `mongodb+srv://${mongodbUser}:${mongodbPassword}@wilsonapps-hcnto.mongodb.net/cafe`;
}
process.env.URL_MONGODB = mongoUrlConnection;
// ====================
//    JWT SEED
// ====================
process.env.JWT_SEED = process.env.JWT_SEED || 'SEED_DEV';
// ====================
//    JWT SEED
// ====================
process.env.GOOGLE_SIGN_IN_CLIENT_ID = process.env.GOOGLE_SIGN_IN_CLIENT_ID || '831496965479-54c4p69e84jigt14i8rg7771rmcnt37s.apps.googleusercontent.com';