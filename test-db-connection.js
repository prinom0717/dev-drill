// DB接続テストスクリプト
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

require("dotenv/config");

async function testConnection() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "設定されています" : "設定されていません");
  
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL環境変数が設定されていません");
    return;
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log("データベース接続をテスト中...");
    
    // 接続テスト
    const count = await prisma.exam.count();
    console.log("✓ データベース接続成功");
    console.log(`現在のExam数: ${count}`);
    
    // テーブル一覧確認
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("テーブル一覧:", tables.map(t => t.table_name));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("✗ データベース接続エラー:", error.message);
  }
}

testConnection();
