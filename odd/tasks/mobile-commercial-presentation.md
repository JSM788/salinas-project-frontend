# Commercial mobile presentation sheets
Objective: update thirteen four-view mobile sheets against the current web scenario; preserve originals and source code.
Route: inline image editing with built-in image_gen; delivery: separate presentation folder, original filenames and an ordered replacement index. No commits or remote publication.

## Specs
- S1: User authorization: "ok hazlo"; scope: "Solo enfócate en el comercial nada más".
- S2: "la continuidad del flujo en orden correspondiente" and "si no voy a tener que cortar cada parte". Four views per sheet, left to right, grouped by task.
- S3: Preserve original source sheets. Save all thirteen replacements in imagenes/mobile-presentacion using the same filenames.
- S4: Use current CL-001/Ana/16 October 2026 scenario, 10 requested/8 accepted/2 unmet, S/180 and S/1,440; distinguish awaiting-file payment, conciliation and SAP reserve.
- S5: Do not include management actions, unsupported personal targets or offline promises. No frontend edits. Spanish UI matches the existing artifacts.

## Tasks
- T01 S1-S5 inline complete (visual readback): access and workday.
- T02 S1-S5 inline complete (visual readback): agenda and check-in.
- T03 S1-S5 inline complete (visual readback): audit, evidence and visit closure.
- T04 S1-S5 inline complete (visual readback): assigned clients and client inquiry.
- T05 S1-S5 inline complete (visual readback): quote selection and quantities.
- T06 S1-S5 inline complete (visual readback): quote review and sharing.
- T07 S1-S5 inline complete (visual readback): invoice payment reporting.
- T08 S1-S5 inline complete (visual readback): quote consultation after order acceptance.
- T09 S1-S5 inline complete (visual readback): order review and consultation.
- T10 S1-S5 inline complete (visual readback): order payment report and consultation.
- T11 S1-S5 inline complete (visual readback): extraordinary visit and POP request branches.
- T12 S1-S5 inline complete (visual readback): expense reporting and receipt.
- T13 S1-S5 inline complete (visual readback): workday closure and navigation.
- T14 S1-S5 inline complete (visual readback): inspect every generated sheet, package replacements, index and ZIP.

## Log
- L1: Original implementation authorization: "ok hazlo". Previous user scope requires coherent four-view sheets for tomorrow's presentation, Commercial only, exact replacement list and no individual cropping.
- L2: Reviewed all original thirteen sheets in prior turn; source/mocks and live web were reviewed. Field actions remain illustrative, not implemented mobile functionality. Unsupported offline/personal-target panels will be replaced by views of the same workday flow rather than invented claims.
- L3: Additional checked correction: GAS-021 supplier RUC is 20100566871, distinct from client RUC 20123456789.
- L4: Generated and visually inspected all thirteen four-phone sheets with built-in image_gen; corrected exact invoice IDs, quote validity, seller assignments, chronology, supplier RUC, payment amount/operation continuity, and pre-/post-report states. Reordered expense and request views within their tasks.
- L5: Delivery saved to imagenes/mobile-presentacion (original filenames) and imagenes/mobile-presentacion-comercial.zip (numbered order 01–13), plus replacement index. ZIP contains 13 PNGs, the index and support prompts. All copies and archived PNGs matched SHA-256; originals matched the pre-copy hash snapshot. All 13 PNG headers confirmed landscape orientation.
- L6: Passive image/document edits require visual and structural checks, not runnable RED/GREEN or frontend tests. No frontend source edited, no commit/push/PR. Tracking/mirror are administrative artifacts; field GPS/camera rules and the explicitly labeled early-closure example remain illustrative, not a claim that the mobile app is functional.
