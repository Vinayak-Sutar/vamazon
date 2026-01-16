---
dataset_info:
  features:
  - name: asin
    dtype: string
  - name: category
    dtype: string
  - name: img_url
    dtype: string
  - name: title
    dtype: string
  - name: feature-bullets
    sequence: string
  - name: tech_data
    sequence:
      sequence: string
  - name: labels
    dtype: string
  - name: tech_process
    dtype: string
  splits:
  - name: train
    num_bytes: 75797
    num_examples: 20
  download_size: 62474
  dataset_size: 75797
license: cc-by-nc-4.0
task_categories:
- text-generation
language:
- en
size_categories:
- n<1K
---
# Dataset Card for "amazon-product-data-filter"

## Dataset Description

- **Homepage:** [τenai.io - AI Consulting](https://www.tenai.io/)
- **Point of Contact:** [Iftach Arbel](mailto:ia@momentum-ai.io)

### Dataset Summary

The Amazon Product Dataset contains product listing data from the Amazon US website. It can be used for various NLP and classification tasks, such as text generation, product type classification, attribute extraction, image recognition and more. 

**NOTICE:** This is a sample of the full [Amazon Product Dataset](https://huggingface.co/datasets/iarbel/amazon-product-data-filter), which contains 1K examples. Follow the link to gain access to the full dataset.

### Languages

The text in the dataset is in English.

## Dataset Structure

### Data Instances

Each data point provides product information, such as ASIN (Amazon Standard Identification Number), title, feature-bullets, and more.

### Data Fields

- `asin`: Amazon Standard Identification Number.
- `category`: The product category. This field represents the search-string used to obtain the listing, it is not the product category as appears on Amazon.com.
- `img_url`: Main image URL from the product page.
- `title`: Product title, as appears on the product page.
- `feature-bullets`: Product feature-bullets list, as they appear on the product page.
- `tech_data`: Product technical data (material, style, etc.), as they appear on the product page. Structured as a list of tuples, where the first element is a feature (e.g. material) and the second element is a value (e.g. plastic).
- `labels`: A processed instance of `feature-bullets` field. The original feature-bullets were aligned to form a standard structure with a capitalized prefix, remove emojis, etc. Finally, the list items were concatenated to a single string with a `\n` seperator.
- `tech_process`: A processed instance of `tech_data` field. The original tech data was filtered and transformed from a `(key, value)` structure to a natural language text.

### Data Splits

The sample dataset has 20 train examples. For the full dataset cilck [here](https://huggingface.co/datasets/iarbel/amazon-product-data-filter).

## Dataset Creation

### Curation Rationale

This dataset was built to provide high-quality data in the e-commerce domain, and fine-tuning LLMs for specific tasks. Raw, unstractured data was collected from Amazom.com, parsed, processed, and filtered using various techniques (annotations, rule-based, models).

### Source Data

#### Initial Data Collection and Normalization

The data was obtained by collected raw HTML data from Amazom.com.

### Annotations

The dataset does not contain any additional annotations.

### Personal and Sensitive Information

There is no personal information in the dataset.

## Considerations for Using the Data

### Social Impact of Dataset

To the best of our knowledge, there is no social impact for this dataset. The data is highly technical, and usage for product text-generation or classification does not pose a risk.

### Other Known Limitations

The quality of product listings may vary, and may not be accurate.

## Additional Information

### Dataset Curators

The dataset was collected and curated by [Iftach Arbel](mailto:ia@momentum-ai.io).

### Licensing Information

The dataset is available under the [Creative Commons NonCommercial (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/legalcode).

### Citation Information

```
@misc{amazon_product_filter,
  author = {Iftach Arbel},
  title = {Amazon Product Dataset Sample},
  year = {2023},
  publisher = {Huggingface},
  journal = {Huggingface dataset},
  howpublished = {https://huggingface.co/datasets/iarbel/amazon-product-data-sample},
}
```