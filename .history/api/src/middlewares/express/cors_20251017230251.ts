import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
	origin: [
		process.env.CLIENT_URL || "http://localhost:3000",
		"http://localhost:3000",
		"http://localhost:3001", 
		"http://localhost:3002",
		"http://localhost:3003",
		"http://localhost:3004",
		"http://localhost:3005",
		"http://localhost:3006",
		"http://localhost:3007",
		"http://localhost:3008",
		"http://localhost:3009",
		"http://localhost:3010",
	],
	credentials: true,
};

export default corsOptions;
