import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        NODE_ENV: "test",
        PORT: 3000,
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("getApiInfo", () => {
    it("should return API information", () => {
      const result = appController.getApiInfo();
      
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("endpoints");
      expect(result.status).toBe("operational");
    });
  });

  describe("healthCheck", () => {
    it("should return health status", () => {
      const result = appController.healthCheck();
      
      expect(result.status).toBe("OK");
      expect(result.timestamp).toBeDefined();
    });
  });
});
