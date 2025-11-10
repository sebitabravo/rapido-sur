import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";

// Mock nodemailer at module level
const mockSendMail = jest.fn();
const mockVerify = jest.fn();
const mockCreateTransport = jest.fn(() => ({
  sendMail: mockSendMail,
  verify: mockVerify,
}));

jest.mock("nodemailer", () => ({
  createTransport: (...args) => mockCreateTransport(...args),
}));

describe("MailService", () => {
  let service: MailService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        MAIL_HOST: "smtp.gmail.com",
        MAIL_PORT: 587,
        MAIL_SECURE: false,
        MAIL_USER: "test@rapidosur.cl",
        MAIL_PASSWORD: "password",
        MAIL_FROM: "noreply@rapidosur.cl",
        MAINTENANCE_MANAGER_EMAIL: "jefe@rapidosur.cl",
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockVerify.mockImplementation((callback) => callback(null));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sendMail", () => {
    it("should send email successfully", async () => {
      mockSendMail.mockResolvedValue({ messageId: "test-id" });

      await service.sendMail(
        "user@test.com",
        "Test Subject",
        "<p>Test HTML</p>",
      );

      expect(mockSendMail).toHaveBeenCalledWith({
        from: "noreply@rapidosur.cl",
        to: "user@test.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
      });
    });

    it("should throw error if sendMail fails", async () => {
      mockSendMail.mockRejectedValue(new Error("SMTP Error"));

      await expect(
        service.sendMail("user@test.com", "Subject", "HTML"),
      ).rejects.toThrow("SMTP Error");
    });
  });

  describe("sendPreventiveAlerts", () => {
    it("should send preventive alerts email to manager", async () => {
      mockSendMail.mockResolvedValue({ messageId: "test-id" });

      const alerts = [
        {
          patente: "ABCD-12",
          modelo: "Mercedes Sprinter",
          razon: "1000 km antes del mantenimiento",
        },
        {
          patente: "EFGH-34",
          modelo: "Ford Transit",
          razon: "7 días antes del mantenimiento",
        },
      ];

      await service.sendPreventiveAlerts(alerts);

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];

      expect(callArgs.to).toBe("jefe@rapidosur.cl");
      expect(callArgs.subject).toContain("Alerta");
      expect(callArgs.html).toContain("ABCD-12");
      expect(callArgs.html).toContain("Mercedes Sprinter");
      expect(callArgs.html).toContain("1000 km antes del mantenimiento");
    });

    it("should throw error if manager email is not configured", async () => {
      const originalGet = mockConfigService.get;
      mockConfigService.get = jest.fn((key: string) => {
        if (key === "MAINTENANCE_MANAGER_EMAIL") return undefined;
        return originalGet(key);
      });

      const alerts = [
        {
          patente: "ABCD-12",
          modelo: "Mercedes",
          razon: "Test",
        },
      ];

      await expect(service.sendPreventiveAlerts(alerts)).rejects.toThrow(
        /Manager email not configured/,
      );

      mockConfigService.get = originalGet;
    });

    it("should handle empty alerts array", async () => {
      mockSendMail.mockResolvedValue({ messageId: "test-id" });

      await service.sendPreventiveAlerts([]);

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe("enviarAlertasPreventivas", () => {
    it("should send alerts using Alerta entities", async () => {
      mockSendMail.mockResolvedValue({ messageId: "test-id" });

      const alertas = [
        {
          id: 1,
          vehiculo: {
            id: 1,
            patente: "ABCD-12",
            marca: "Mercedes",
            modelo: "Sprinter",
          },
          tipo_alerta: "Kilometraje",
          mensaje: "Mantenimiento próximo",
          fecha_generacion: new Date(),
          email_enviado: false,
        },
      ] as any;

      await service.enviarAlertasPreventivas(alertas);

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];

      expect(callArgs.html).toContain("ABCD-12");
      expect(callArgs.html).toContain("Mercedes");
      expect(callArgs.html).toContain("Sprinter");
    });
  });
});
