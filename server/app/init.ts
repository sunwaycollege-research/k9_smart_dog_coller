import { ConnectDB } from "../services/database.js";

export default async function Initialize() {
  await ConnectDB();
}

