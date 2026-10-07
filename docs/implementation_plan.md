# Implementation Plan

## Goal Description
The classifier currently always predicts **Karacadag** regardless of input, and the Streamlit app cannot upload images due to runtime errors. We need to:
1. Refine the scoring decision tree so that predictions reflect the extracted features (size, shape, color, texture) correctly.
2. Adjust the texture influence weighting to be meaningful but not overwhelming.
3. Fix the image upload workflow in the Streamlit UI.
4. Ensure the app can start on the desired port (8503) without conflicts.

## User Review Required
> [!IMPORTANT]
> The proposed changes modify the scoring algorithm and UI logic. Please confirm the desired weighting for texture (e.g., how many points should be added for a *Rough* texture) and whether you prefer to keep using port **8503** or switch to another port.

## Open Questions
> [!QUESTION]
> - What maximum score adjustment should texture contribute (e.g., ±5, ±10)?
> - Should we add a fallback to automatically select an available port if 8503 is busy?
> - Do you want the email onboarding prompt completely disabled (add `STREAMLIT_SERVER_HEADLESS=true` env var) or keep it as is?

## Proposed Changes
---
### Scoring Logic (app.py)
- Refactor the scoring block into a dedicated function `apply_scoring(measurements, scores)` for clarity.
- Introduce a **texture weight** constant (`TEXTURE_WEIGHT = 8`).
- Apply texture points proportionally:
  ```python
  if measurements["texture_label"] == "Rough":
      scores["Basmati"] += TEXTURE_WEIGHT
      scores["Jasmine"] += int(TEXTURE_WEIGHT/2)
  else:
      scores["Arborio"] += int(TEXTURE_WEIGHT/2)
      scores["Karacadag"] += TEXTURE_WEIGHT
  ```
- Ensure the baseline scores from size/shape/color are unchanged.
- After scoring, recompute `total`, `best`, and `confidence` as before.

---
### UI Upload Fix (app.py)
- Move the file uploader handling into a separate block to guarantee `image_np` is set only when a valid image is present.
- Add a guard that shows an error if the uploaded file cannot be opened:
  ```python
  if uploaded:
      try:
          img = Image.open(uploaded).convert("RGB")
      except Exception as e:
          st.error(f"Unable to read image: {e}")
          st.stop()
  ```
- Ensure the sidebar radio selection defaults to "Sample from dataset" to avoid a `None` state.

---
### Port Management (run commands)
- Before launching Streamlit, check if port 8503 is free. If not, kill the existing PID (as we did earlier) or fall back to a configurable port (e.g., `STREAMLIT_PORT=8504`).
- Add environment variable `STREAMLIT_SERVER_HEADLESS=true` to suppress the onboarding email prompt.

---
### Configuration Files
- Update `~/.streamlit/config.toml` to include `headless = true` under `[server]` (already present) and add `serverPort = $STREAMLIT_PORT`.
- Ensure `~/.streamlit/credentials.toml` contains `email = ""` (already created).

## Verification Plan
- **Automated Tests**: Run the app locally, upload a sample image, and verify that the predicted variety changes based on the visible differences (e.g., a bright, elongated grain should yield *Basmati*).
- **Manual Verification**: Check the Streamlit UI for the email prompt (should be hidden) and confirm that image upload works without errors.
- **Port Check**: Confirm the app starts on the chosen port and no other process is listening on it.

### Automated Tests
```
# No unit tests are present; manual run will be performed.
```
