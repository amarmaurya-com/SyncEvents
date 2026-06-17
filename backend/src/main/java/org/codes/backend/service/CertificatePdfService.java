package org.codes.backend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.codes.backend.model.Certificate;
import org.codes.backend.model.CertificateType;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class CertificatePdfService {
    private static final PDType1Font FONT_REGULAR = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDType1Font FONT_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font FONT_OBLIQUE = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);
    private static final PDType1Font FONT_SERIF_BOLD = new PDType1Font(Standard14Fonts.FontName.TIMES_BOLD);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public byte[] generate(Certificate certificate) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(new PDRectangle(842, 595));
            document.addPage(page);

            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                drawCertificate(stream, certificate);
            }

            document.save(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to generate certificate PDF.", ex);
        }
    }

    private void drawCertificate(PDPageContentStream stream, Certificate certificate) throws IOException {
        boolean achievement = certificate.getCertificateType() == CertificateType.ACHIEVEMENT;
        Color accent = achievement ? new Color(5, 150, 105) : new Color(124, 58, 237);
        Color gold = new Color(180, 125, 25);
        Color ink = new Color(15, 23, 42);
        Color muted = new Color(100, 116, 139);

        stream.setNonStrokingColor(new Color(248, 250, 252));
        stream.addRect(0, 0, 842, 595);
        stream.fill();

        stream.setStrokingColor(accent);
        stream.setLineWidth(6);
        stream.addRect(32, 32, 778, 531);
        stream.stroke();

        stream.setStrokingColor(gold);
        stream.setLineWidth(1.5f);
        stream.addRect(48, 48, 746, 499);
        stream.stroke();

        stream.setNonStrokingColor(accent);
        stream.addRect(72, 512, 698, 2);
        stream.fill();

        drawCenteredText(stream, "SMART EVENT MANAGER", FONT_BOLD, 16, 487, ink);
        drawCenteredText(
                stream,
                achievement ? "CERTIFICATE OF ACHIEVEMENT" : "CERTIFICATE OF PARTICIPATION",
                FONT_SERIF_BOLD,
                34,
                438,
                accent
        );
        drawCenteredText(stream, "This certificate is proudly presented to", FONT_OBLIQUE, 16, 392, muted);
        drawCenteredText(stream, certificate.getParticipant().getName(), FONT_SERIF_BOLD, 38, 337, ink);

        String description = achievement
                ? "For outstanding achievement in"
                : "For active participation in";
        drawCenteredText(stream, description, FONT_REGULAR, 15, 292, muted);
        drawCenteredText(stream, certificate.getEvent().getName(), FONT_BOLD, 24, 252, ink);

        if (achievement && certificate.getRank() != null) {
            drawCenteredText(stream, "Rank " + certificate.getRank(), FONT_BOLD, 18, 213, gold);
        }

        drawCenteredText(
                stream,
                "Certificate No: " + certificate.getCertificateNumber(),
                FONT_REGULAR,
                11,
                154,
                muted
        );
        drawCenteredText(
                stream,
                "Generated: " + certificate.getGeneratedAt().format(DATE_FORMATTER),
                FONT_REGULAR,
                11,
                136,
                muted
        );

        drawSignature(stream, 160, 92, "Coordinator Signature", muted);
        drawSignature(stream, 540, 92, "Authorized Signature", muted);
    }

    private void drawSignature(
            PDPageContentStream stream,
            float x,
            float y,
            String label,
            Color color
    ) throws IOException {
        stream.setStrokingColor(color);
        stream.setLineWidth(1);
        stream.moveTo(x, y + 26);
        stream.lineTo(x + 150, y + 26);
        stream.stroke();

        drawText(stream, label, FONT_REGULAR, 10, x + 24, y, color);
    }

    private void drawCenteredText(
            PDPageContentStream stream,
            String text,
            PDType1Font font,
            float fontSize,
            float y,
            Color color
    ) throws IOException {
        String safeText = text == null ? "" : text;
        float width = font.getStringWidth(safeText) / 1000 * fontSize;
        drawText(stream, safeText, font, fontSize, (842 - width) / 2, y, color);
    }

    private void drawText(
            PDPageContentStream stream,
            String text,
            PDType1Font font,
            float fontSize,
            float x,
            float y,
            Color color
    ) throws IOException {
        stream.beginText();
        stream.setFont(font, fontSize);
        stream.setNonStrokingColor(color);
        stream.newLineAtOffset(x, y);
        stream.showText(clean(text));
        stream.endText();
    }

    private String clean(String value) {
        return value == null ? "" : value.replaceAll("[^\\p{Print}]", "").toUpperCase(Locale.ROOT);
    }
}
