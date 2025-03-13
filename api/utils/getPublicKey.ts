import fs from "fs";
import { env } from "./env.js";

export const getPublicKey = (): string => {
  try {
    return fs.readFileSync(`${env.publicKeyDir}`, "utf8");
  } catch (error) {
    console.error("Ошибка чтения публичного ключа:", error);
    throw new Error(
      "Не удалось загрузить публичный ключ для проверки токенов."
    );
  }
};
