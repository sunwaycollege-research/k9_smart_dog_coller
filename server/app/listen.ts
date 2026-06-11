import type { Express } from "express";
const env = process.env.NODE_ENV;

export default function listen(app: Express) {
  if (env == "development") {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  }
  if (env == "production") {
    app.listen(process.env.PORT);
  }
}
