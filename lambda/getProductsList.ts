import { data } from "../util/util";

  
exports.handler = async () => {
    try {

      return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
    } catch (error) {

      return {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        }),
      };
    }
  };