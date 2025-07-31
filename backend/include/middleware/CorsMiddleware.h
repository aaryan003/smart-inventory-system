#pragma once
#include "crow.h"

struct CORSHandler {
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context&) {
        res.add_header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.add_header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.add_header("Access-Control-Allow-Credentials", "true");

        if (req.method == "OPTIONS"_method) {
            res.code = 204;
            res.end();
        }
    }

    // 3-argument version
    void after_handle(const crow::request&, crow::response& res, context&) {
        res.add_header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.add_header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.add_header("Access-Control-Allow-Credentials", "true");
    }

    // 4-argument version for compatibility with some Crow builds
    void after_handle(const crow::request& req, crow::response& res, context& ctx, crow::detail::context<CORSHandler>& global_ctx) {
        // Just call the three-argument version to avoid code duplication
        after_handle(req, res, ctx);
    }
};
