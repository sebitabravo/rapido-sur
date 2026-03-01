import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MailService } from "./mail.service";
import { Usuario } from "../users/entities/usuario.entity";

const mockSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

describe("MailService", () => {
  let service: MailService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        RESEND_API_KEY: "test_key",
        MAIL_FROM: "noreply@rapidosur.cl",
        MAINTENANCE_MANAGER_EMAIL: "jefe@rapidosur.cl",
      };
      return config[key];
    }),
  };

  const mockUsuarioRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepo,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should send email successfully", async () => {
    mockSend.mockResolvedValue({ data: { id: "1" }, error: null });

    await service.sendMail("user@test.com", "Test Subject", "<p>Test HTML</p>");

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["user@test.com"],
        subject: "Test Subject",
      }),
    );
  });

  it("should send preventive alerts to managers", async () => {
    mockUsuarioRepo.find.mockResolvedValue([
      { email: "manager@test.com" },
    ] as Usuario[]);
    mockSend.mockResolvedValue({ data: { id: "1" }, error: null });

    await service.sendPreventiveAlerts([
      { patente: "ABCD-12", modelo: "Sprinter", razon: "Test" },
    ]);

    expect(mockUsuarioRepo.find).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalled();
  });
});
