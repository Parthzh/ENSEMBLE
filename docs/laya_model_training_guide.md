# Laya Model Training Guide: Fine-Tuning the System 1 Decision Engine in Google Colab

This guide details the exact steps required to fine-tune **Laya**—the open-source, non-autoregressive "System 1" decision engine by Convai Innovations—on Google Colab to achieve the highest possible accuracy and calibration for your specific typed-decision tasks.

Unlike traditional autoregressive LLMs, Laya is built on a ModernBERT-large backbone (~421M parameters) and uses Reinforcement Learning for Calibrated Decisions (RLCD). Fine-tuning is **highly recommended**, as base checkpoints are not fully adapted to domain-specific schemas.

## 1. Preparing the Colab Environment

To fine-tune Laya effectively, you should utilize a multi-GPU environment. Colab Pro's A100 or Kaggle's free 2xT4 GPUs are ideal. The official Convai Innovations repository provides a script specifically for this: `laya_finetune_typed_decisions_2xT4_kaggle.ipynb`.

1. Clone the official repository in Colab:
```bash
!git clone https://github.com/NandhaKishorM/laya.git
%cd laya
!pip install -r requirements.txt
```

## 2. Structuring Your Dataset for Laya Primitives

Laya evaluates three specific question types (primitives). For maximum accuracy, your training data must strictly map to one of these:
*   **Choice:** Selecting a label from predefined options (e.g., classifying a category).
*   **Score:** Placing an input on an ordinal rubric (e.g., 1–5 scale).
*   **Noul:** A Yes/No boolean proposition.

For your classification tasks, format your dataset using the **Choice** primitive. Ensure your data contains clear, structured inputs mapping to exactly the set of allowed labels.

## 3. Training Methodology: RLCD (Reinforcement Learning for Calibrated Decisions)

Laya does not use standard Cross-Entropy loss for fine-tuning. Instead, it uses a GRPO-style policy gradient approach combined with strictly proper scoring rules. This is the secret to getting highly accurate, "honest" probabilities without hallucinations.

Run the distributed training script using PyTorch DDP (Distributed Data Parallel):
```bash
!torchrun --nproc_per_node=2 notebooks/train_rlcd.py \
    --dataset_path /content/your_dataset.jsonl \
    --model_name_or_path convaiinnovations/laya \
    --output_dir /content/laya_finetuned \
    --batch_size 16 \
    --learning_rate 2e-5
```
*(Note: Refer to the specific arguments in the official `notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb` script as they are frequently updated).*

## 4. Hyperparameter Optimization for Maximum Accuracy

To squeeze out the highest performance:
*   **Learning Rate:** Keep it low (`1e-5` to `3e-5`) since you are fine-tuning a pre-trained ModernBERT backbone.
*   **Batch Size:** Maximize the batch size to stabilize the reinforcement learning gradients. Use gradient accumulation if you run out of VRAM.
*   **Epochs:** Monitor the RLCD reward metric. Overfitting happens quickly in decision engines, so rely heavily on early stopping based on a hold-out validation set.

## 5. The Critical Final Step: Calibration

Because base models can be overconfident, fine-tuning Laya is not complete until you calibrate it. You must "fit calibration temperatures" per question type.

This ensures that when Laya outputs an 85% probability for a Choice, it is historically accurate 85% of the time. The repository provides calibration scripts that run over your validation set to find the optimal temperature scaling parameters.

```python
# Conceptual example based on Laya's calibration pipeline
from laya.calibration import fit_temperatures

# Fit temperatures using your hold-out validation predictions
optimal_temps = fit_temperatures(val_predictions, val_ground_truth)
print(f"Calibrated Temperatures: {optimal_temps}")
```

## Summary Checklist for Maximum Accuracy
- [ ] Format your domain data strictly into Laya's `Choice`, `Score`, or `Noul` primitives.
- [ ] Use a multi-GPU Colab/Kaggle environment for DDP training.
- [ ] Train using the official RLCD (Reinforcement Learning for Calibrated Decisions) scripts, not standard supervised fine-tuning.
- [ ] Run the temperature calibration step on a hold-out validation set to ensure reliable confidence scores.
