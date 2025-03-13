import "isomorphic-fetch";

import { initializeApp } from "./app/initialize.js";
import { initializeLogger } from "./logger/initialize.js";

initializeLogger();
initializeApp();
