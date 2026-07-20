# Swadesh Game

日本語の意味を選びながら、次の4言語の基礎単語を学べるブラウザクイズです。

- 🇹🇷 トルコ語
- 🇸🇦 アラビア語（ラテン文字転写付き）
- 🇮🇷 ペルシア語（ラテン文字転写付き）
- 🇲🇳 モンゴル語

4言語から任意の2言語を選び、第1言語、第2言語の順番で同じ単語を確認できます。解答後には、選択した2言語の簡単な例文と日本語訳も表示されます。間違えた単語は、1問以上間隔を空けて再出題されます。

## 実行方法

依存パッケージやビルドは不要です。`index.html` をブラウザで開くか、リポジトリのルートでローカルサーバーを起動してください。

```sh
python3 -m http.server 8000
```

その後、`http://localhost:8000` を開きます。

## 本番環境

`main`または`master`ブランチへ変更が反映されると、GitHub Actionsが構文検査を行い、GitHub Pagesへ自動的にデプロイします。

本番URL: <https://mossan-lingvo.github.io/swadeshgame/>

初回のみ、GitHubリポジトリの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択してください。以後はブランチへの反映時に自動更新されます。必要に応じて、Actions画面の **Deploy to GitHub Pages** から手動実行することもできます。
