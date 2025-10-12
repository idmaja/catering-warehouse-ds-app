package routes

import (
	"warehouse-trial-gin/config"
	"warehouse-trial-gin/controller"
	middlewares "warehouse-trial-gin/middleware"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service/implementations"
	"warehouse-trial-gin/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRoutes(router *gin.Engine, db *mongo.Client) {
	// Inisialisasi repositori, layanan, dan controller
	userRepo := repository.NewUserRepository(db)
	itemRepo := repository.NewItemRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	auditRepo := repository.NewAuditRepository(db)
	
	// Catering repositories
	menuCategoryRepo := repository.NewMenuCategoryRepository(db)
	menuRepo := repository.NewMenuRepository(db)
	submenuRepo := repository.NewSubmenuRepository(db)
	cateringOrderRepo := repository.NewCateringOrderRepository(db)

	auditService := implementations.NewAuditService(auditRepo)
	telegramService := implementations.NewTelegramService(config.LoadConfig(), auditService, orderRepo)
	authService := implementations.NewAuthService(*userRepo, config.LoadConfig(), auditService)
	itemService := implementations.NewItemService(itemRepo, *categoryRepo, auditService)
	categoryService := implementations.NewCategoryService(*categoryRepo, auditService)
	orderService := implementations.NewOrderService(orderRepo, itemRepo, userRepo, auditService)
	reportService := implementations.NewReportService(itemRepo, orderRepo, *categoryRepo, db)
	
	// Catering services
	menuCategoryService := implementations.NewMenuCategoryService(menuCategoryRepo, auditService)
	menuService := implementations.NewMenuService(menuRepo, menuCategoryRepo, auditService)
	submenuService := implementations.NewSubmenuService(submenuRepo, menuCategoryRepo, auditService)
	cateringOrderService := implementations.NewCateringOrderService(cateringOrderRepo, menuRepo, submenuRepo, userRepo, auditService)

	authController := controller.NewAuthController(authService, auditService, telegramService)
	itemController := controller.NewItemController(itemService)
	categoryController := controller.NewCategoryController(categoryService)
	orderController := controller.NewOrderController(orderService, telegramService)
	reportController := controller.NewReportController(reportService)
	auditController := controller.NewAuditController(auditService)
	
	// Catering controllers
	menuCategoryController := controller.NewMenuCategoryController(menuCategoryService)
	menuController := controller.NewMenuController(menuService)
	submenuController := controller.NewSubmenuController(submenuService)
	cateringOrderController := controller.NewCateringOrderController(cateringOrderService, telegramService)
	
	// Start daily report scheduler
	utils.StartDailyReportScheduler(telegramService)

	// Rute publik (tanpa otentikasi)
	public := router.Group("/api/v1")
	{
		public.POST("/login", authController.Login)
		public.GET("/auth/google", authController.GoogleAuth)
		public.GET("/auth/google/callback", authController.GoogleCallback)
	}

	// Rute yang dilindungi (dengan otentikasi)
	protected := router.Group("/api/v1")
	protected.Use(middlewares.AuthMiddleware())
	// protected.Use(middlewares.AuditMiddleware(auditService))
	{
		// Rute untuk pengguna dengan peran 'admin' atau 'superadmin'
		admin := protected.Group("/admin")
		admin.Use(middlewares.RoleMiddleware("admin", "superadmin"))
		{
			// Warehouse management
			admin.POST("/items", itemController.CreateItem)
			admin.PUT("/items/:id", itemController.UpdateItem)
			admin.DELETE("/items/:id", itemController.DeleteItem)
			
			admin.POST("/categories", categoryController.CreateCategory)
			admin.PUT("/categories/:id", categoryController.UpdateCategory)
			admin.DELETE("/categories/:id", categoryController.DeleteCategory)
			
			admin.POST("/orders", orderController.CreateOrder)
			admin.PUT("/orders/:id/status", orderController.UpdateOrderStatus)
			admin.DELETE("/orders/:id", orderController.DeleteOrder)
			
			// Catering management
			admin.POST("/menu-categories", menuCategoryController.CreateMenuCategory)
			admin.PUT("/menu-categories/:id", menuCategoryController.UpdateMenuCategory)
			admin.DELETE("/menu-categories/:id", menuCategoryController.DeleteMenuCategory)
			
			admin.POST("/menus", menuController.CreateMenu)
			admin.PUT("/menus/:id", menuController.UpdateMenu)
			admin.DELETE("/menus/:id", menuController.DeleteMenu)
			
			admin.POST("/submenus", submenuController.CreateSubmenu)
			admin.PUT("/submenus/:id", submenuController.UpdateSubmenu)
			admin.DELETE("/submenus/:id", submenuController.DeleteSubmenu)
			
			admin.POST("/catering-orders", cateringOrderController.CreateCateringOrder)
			admin.PUT("/catering-orders/:id/status", cateringOrderController.UpdateCateringOrderStatus)
			admin.DELETE("/catering-orders/:id", cateringOrderController.DeleteCateringOrder)
		}

		// Rute untuk pengguna dengan peran 'superadmin' saja
		superAdmin := protected.Group("/superadmin")
		superAdmin.Use(middlewares.RoleMiddleware("superadmin"))
		{
			superAdmin.GET("/users", authController.GetAllUsers) 
			superAdmin.POST("/users", authController.CreateUser) 
			superAdmin.PUT("/users/:id", authController.UpdateUser)
			superAdmin.DELETE("/users/:id", authController.DeleteUser)
			
			superAdmin.POST("/orders", orderController.CreateOrder)
			superAdmin.PUT("/orders/:id/status", orderController.UpdateOrderStatus)
			superAdmin.DELETE("/orders/:id", orderController.DeleteOrder)
			
			superAdmin.GET("/activity-logs", auditController.FindAllLogs)
			superAdmin.GET("/activity-logs/:id", auditController.FindLogByID)
		}

		// Warehouse management (read-only for all authenticated users)
		protected.GET("/items", itemController.FindAllItems)
		protected.GET("/items/:id", itemController.FindItemByID)
		protected.GET("/items/stats", itemController.GetStats)
		protected.GET("/items/generate-sku", itemController.GenerateSKU)
		
		protected.GET("/categories", categoryController.GetAllCategories)
		
		protected.GET("/orders", orderController.GetAllOrders)
		protected.GET("/orders/:id", orderController.GetOrderByID)
		
		// Catering management (read-only for all authenticated users)
		protected.GET("/menu-categories", menuCategoryController.GetAllMenuCategories)
		
		protected.GET("/menus", menuController.FindAllMenus)
		protected.GET("/menus/:id", menuController.FindMenuByID)
		
		protected.GET("/submenus", submenuController.FindAllSubmenus)
		protected.GET("/submenus/:id", submenuController.FindSubmenuByID)
		
		protected.GET("/catering-orders", cateringOrderController.GetAllCateringOrders)
		protected.GET("/catering-orders/:id", cateringOrderController.GetCateringOrderByID)
		
		protected.GET("/reports/dashboard", reportController.GetDashboardReport)
	}
}
