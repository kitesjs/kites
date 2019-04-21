# Development Tools

* node ^8.11.1
* npm ^6.0.1
* yarn ^1.7.0
* typescript ^3.1.2
* tslint ^5.11.0
* ts-node ^7.0.1
* mocha ^5.2.0
* chai ^4.2.0

# Installation Scripts

1. npm install -g typescript@latest
2. npm install -g tslint@latest
3. yarn add --dev ts-node tslint typescript typescript-eslint-parser @types/node rimraf

# Visual Studio Code IDE

* VS Code 1.25.0
* EditorConfig for VS Code
* TSLint for VS Code
* GitLens

# Quy trình cập nhật phiên bản npmjs

1. Mở Terminal or CMD
2. Kiểm tra phiên bản hiện tại, release-it sẽ lấy làm căn cứ để đánh phiên bản tiếp theo
    * Hiện tại npm scripts, cấu hình `release-it` quản lý semver ở mức độ `patch`
    * Ví dụ phiên bản hiện tại đang là `1.1.0-beta.1`, next sẽ là `1.1.0-beta.2`
    * Ví dụ phiên bản hiện tại là `1.1.1`, next sẽ là `1.1.2`
3. Chạy lệnh build và nâng phiên bản mới, chú ý tùy chọn commit và đẩy tags lên Github luôn
    * > npm run release:beta
4. Phát hành phiên bản `beta` với lệnh
    * > npm run build
    * > npm publish dist/ --tag beta
