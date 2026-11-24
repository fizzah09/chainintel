"""Download the public training dataset and label lists into ml/data/ (not committed)."""
import urllib.request
from config import DATA, DATASET_URL, DATASET_FILE, OFAC_URL, DARKLIST_URL


def get(url, dest):
    print(f"downloading {url}")
    urllib.request.urlretrieve(url, dest)
    print(f"  -> {dest} ({dest.stat().st_size:,} bytes)")


if __name__ == "__main__":
    DATA.mkdir(exist_ok=True)
    get(DATASET_URL, DATASET_FILE)
    get(OFAC_URL, DATA / "ofac_eth.csv")
    get(DARKLIST_URL, DATA / "darklist.json")
