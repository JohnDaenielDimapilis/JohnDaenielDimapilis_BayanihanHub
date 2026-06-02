import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const users = [
  { name: "Maria Santos", email: "admin@bayanihanhub.test", password: "Password123", role: "Admin" },
  { name: "Leo Dela Cruz", email: "staff@bayanihanhub.test", password: "Password123", role: "Staff" },
  { name: "Ana Reyes", email: "user@bayanihanhub.test", password: "Password123", role: "User" }
];

await connectDB();
await User.deleteMany({ email: { $in: users.map((user) => user.email) } });
for (const user of users) {
  await User.create(user);
}
console.log("Seeded demo accounts:");
users.forEach((user) => console.log(`${user.role}: ${user.email} / Password123`));
process.exit(0);
