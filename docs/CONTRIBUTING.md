# 🤝 Contributing Guide — X-Smart

> Hướng dẫn đóng góp cho dự án X-Smart

Cảm ơn bạn đã quan tâm đến việc đóng góp cho **X-Smart**! 🎉

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng — từ **sửa lỗi nhỏ, cải thiện tài liệu** đến **phát triển tính năng mới**.

---
## 📜 Code of Conduct

Dự án này tuân theo [Code of Conduct](./CODE_OF_CONDUCT.md). Bằng cách tham gia, bạn đồng ý tuân thủ các quy tắc này.

## 🎯 Cách đóng góp

### 1. 🐛 Báo cáo lỗi (Bug Reports)

**Trước khi tạo issue:**
- 🔍 Tìm kiếm [existing issues](https://github.com/NEU-DreamChasers/X-Smart/issues) để tránh duplicate
- ✅ Đảm bảo bạn đang dùng phiên bản mới nhất

**Khi tạo bug report, bao gồm:**
- 📝 **Mô tả rõ ràng** về lỗi
- 🔄 **Các bước tái tạo** (step-by-step)
- 🎯 **Kết quả mong đợi** vs **kết quả thực tế**
- 💻 **Môi trường**: OS, Node version, Browser
- 📸 **Screenshots/logs** nếu có

**Template:**
```markdown
### Mô tả lỗi
[Mô tả ngắn gọn về lỗi]

### Các bước tái tạo
1. Truy cập '...'
2. Click vào '...'
3. Scroll xuống '...'
4. Thấy lỗi

### Kết quả mong đợi
[Điều bạn mong đợi xảy ra]

### Kết quả thực tế
[Điều thực sự xảy ra]

### Môi trường
- OS: Windows 11 / macOS 14 / Ubuntu 22.04
- Node: v20.10.0
- Browser: Chrome 120

### Screenshots/Logs
[Nếu có]
```

---

### 2. 💡 Đề xuất tính năng (Feature Requests)

**Khi đề xuất tính năng mới:**
- 🎯 **Mô tả vấn đề** mà tính năng giải quyết
- 💭 **Giải pháp đề xuất** của bạn
- 🔄 **Các lựa chọn khác** bạn đã xem xét
- 📊 **Lợi ích** cho người dùng/dự án

**Template:**
```markdown
### Vấn đề
[Mô tả vấn đề hiện tại]

### Giải pháp đề xuất
[Mô tả tính năng bạn muốn thêm]

### Lựa chọn khác
[Các cách tiếp cận khác đã xem xét]

### Ngữ cảnh bổ sung
[Screenshots, mockups, v.v.]
```

---

### 3. 🔧 Sửa code (Code Contributions)

- 🐛 **Bug fixes** — Sửa lỗi hiện có
- ✨ **New features** — Thêm tính năng mới
- 📚 **Documentation** — Cải thiện docs
- 🎨 **UI/UX** — Cải thiện giao diện
- ⚡ **Performance** — Tối ưu hóa
- ♻️ **Refactoring** — Cải thiện code structure
- 🧪 **Tests** — Thêm/cải thiện tests

---

## 🛠️ Quy trình phát triển

### Bước 1: Fork & Clone

```bash
# Fork repo trên GitHub
# Clone repo về máy
git clone https://github.com/YOUR_USERNAME/X-Smart.git
cd X-Smart

# Thêm upstream remote
git remote add upstream https://github.com/NEU-DreamChasers/X-Smart.git
```

### Bước 2: Tạo branch mới

```bash
# Cập nhật main branch
git checkout main
git pull upstream main

# Tạo branch mới
git checkout -b feat/your-feature-name
```

**Quy tắc đặt tên branch:**
```
feat/feature-name       — Tính năng mới
fix/bug-description     — Sửa lỗi
docs/what-changed       — Cập nhật docs
refactor/module-name    — Refactor code
test/test-description   — Thêm tests
chore/task-name         — Chores (build, config)
```

### Bước 3: Thực hiện thay đổi

```bash
# Làm việc trên code của bạn
# Commit thường xuyên với message rõ ràng

git add .
git commit -m "feat(api): add weather chart endpoint"
```

### Bước 4: Test & Lint

```bash
# Backend
cd backend
npm run test
npm run lint
npm run format

# Frontend
cd frontend
npm run test
npm run lint
npm run format
```

### Bước 5: Push & Create PR

```bash
# Push branch lên fork của bạn
git push origin feat/your-feature-name

# Tạo Pull Request trên GitHub
```

---

## 🏗️ Setup môi trường

### Yêu cầu hệ thống

- **Node.js**: 18.x hoặc cao hơn
- **npm**: 9.x hoặc cao hơn
- **Docker**: 20.x hoặc cao hơn (cho development)
- **Git**: 2.x hoặc cao hơn

### Setup Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Copy environment file
cp .env.example .env

# Chạy database với Docker
docker-compose up -d postgres

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Setup Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Setup đầy đủ với Docker

```bash
# Từ thư mục gốc
docker-compose up -d

# Xem logs
docker-compose logs -f backend
```

**Truy cập:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Scorpio: http://localhost:9090

---

## 📏 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
interface UserDto {
  id: number;
  email: string;
  role: UserRole;
}

async function getUserById(id: number): Promise<UserDto> {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

// ❌ Bad
async function getUser(id: any) {
  const user = await this.userRepository.findOne({ where: { id } });
  return user;
}
```

**Best Practices:**
- ✅ Sử dụng **TypeScript strict mode**
- ✅ Khai báo **types rõ ràng** cho functions, parameters
- ✅ Sử dụng **async/await** thay vì callbacks
- ✅ **Error handling** đầy đủ với try-catch
- ✅ **Validate input** ở controller level
- ✅ Tách **business logic** ra service layer
- ❌ Tránh `any` type
- ❌ Tránh nested callbacks

### Backend (NestJS)

```typescript
// Controller
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: UserDto })
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.findOne(id);
  }
}

// Service
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
```

### Frontend (React)

```typescript
// ✅ Good - Functional component with TypeScript
interface WeatherCardProps {
  temperature: number;
  humidity: number;
  location: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ 
  temperature, 
  humidity, 
  location 
}) => {
  return (
    <div className="card">
      <h2>{location}</h2>
      <p>Temperature: {temperature}°C</p>
      <p>Humidity: {humidity}%</p>
    </div>
  );
};

export default WeatherCard;
```

**React Best Practices:**
- ✅ Functional components với **hooks**
- ✅ **Props interface** cho mọi component
- ✅ Sử dụng **const** cho components
- ✅ **Memoization** khi cần (useMemo, useCallback)
- ❌ Tránh inline styles (dùng Tailwind CSS)
- ❌ Tránh class components

### Code Style

**ESLint & Prettier** đã được config sẵn. Chạy:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

---

## 💬 Commit Convention

Chúng tôi sử dụng **[Conventional Commits](https://www.conventionalcommits.org/)**.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `feat` | Tính năng mới | `feat(api): add user authentication` |
| `fix` | Sửa lỗi | `fix(map): correct marker position` |
| `docs` | Cập nhật docs | `docs(readme): update setup guide` |
| `style` | Code style (không ảnh hưởng logic) | `style: format code with prettier` |
| `refactor` | Refactor code | `refactor(auth): simplify JWT validation` |
| `perf` | Cải thiện performance | `perf(api): optimize database queries` |
| `test` | Thêm/sửa tests | `test(user): add unit tests for user service` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

### Scope (tùy chọn)

Phạm vi của thay đổi:
- `api`, `auth`, `reports`, `map`, `dashboard`
- `backend`, `frontend`, `docs`

### Examples

```bash
# ✅ Good commits
git commit -m "feat(reports): add image upload functionality"
git commit -m "fix(auth): resolve JWT token expiration issue"
git commit -m "docs(api): update endpoints documentation"
git commit -m "refactor(map): extract marker logic to separate component"
git commit -m "test(user): add integration tests for user creation"

# ❌ Bad commits
git commit -m "update"
git commit -m "fix bug"
git commit -m "asdfgh"
git commit -m "WIP"
```

---

## 🔀 Quy trình Pull Request 

### 1. Chuẩn bị PR

**Checklist trước khi tạo PR:**
- ✅ Code đã được **test** locally
- ✅ Tất cả **tests pass**: `npm run test`
- ✅ **Linting pass**: `npm run lint`
- ✅ Code đã được **format**: `npm run format`
- ✅ Không có **console.log** hoặc debug code
- ✅ **Documentation** đã cập nhật (nếu cần)
- ✅ **CHANGELOG** đã cập nhật (nếu là feature lớn)

### 2. Tạo Pull Request

**PR Title:** Theo Conventional Commits
```
feat(reports): add PDF export functionality
fix(map): correct cluster icon size
docs: update contributing guide
```

**PR Description Template:**
```markdown
## 📝 Description
[Mô tả chi tiết về thay đổi]

## 🔗 Related Issue
Fixes #123
Closes #456

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

### How to test
1. Checkout branch
2. Run `npm install`
3. Run `npm run test`
4. Test manually by...

## 📸 Screenshots
[Nếu có UI changes]

## ✅ Checklist
- [ ] Code follows coding standards
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 3. Review Process

1. **Automated checks**: CI/CD sẽ chạy tự động
   - ✅ Tests
   - ✅ Linting
   - ✅ Build

2. **Code review**: Maintainer sẽ review
   - Đọc code changes
   - Test functionality
   - Đề xuất improvements

3. **Address feedback**: 
   - Trả lời comments
   - Push thêm commits để fix
   - Request re-review

4. **Approval & Merge**:
   - Sau khi approved → maintainer merge
   - Branch sẽ được xóa tự động

### 4. Sau khi merge

```bash
# Cập nhật local repo
git checkout main
git pull upstream main

# Xóa branch cũ
git branch -d feat/your-feature-name
```

---

## 🧪 Testing Guidelines

### Run Tests

```bash
# Backend
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report

# Frontend
cd frontend
npm run test              # Jest tests
npm run test:coverage     # Coverage
```

---

## 📚 Documentation

### Khi cần cập nhật docs

- ✅ **API changes** → Update `docs/API.md`
- ✅ **Architecture changes** → Update `docs/ARCHITECTURE.md`
- ✅ **Setup changes** → Update `docs/SETUP.md`
- ✅ **New features** → Update `README.md`

### Viết Documentation

**Code comments:**
```typescript
/**
 * Retrieves weather data for a specific location
 * 
 * @param entityId - The NGSI-LD entity ID
 * @param hours - Number of hours to retrieve (default: 24)
 * @returns Chart data with labels and datasets
 * @throws NotFoundException if entity not found
 */
async getWeatherChart(entityId: string, hours: number = 24): Promise<ChartData> {
  // Implementation
}
```

**API Documentation:**
```typescript
@ApiOperation({ summary: 'Get weather chart data' })
@ApiParam({ name: 'entityId', description: 'Entity ID', type: String })
@ApiQuery({ name: 'hours', required: false, type: Number })
@ApiResponse({ status: 200, description: 'Chart data', type: ChartDataDto })
@ApiResponse({ status: 404, description: 'Entity not found' })
```


## 📞 Liên hệ & Support

### Maintainers

- **GitHub**: [@NEU-DreamChasers](https://github.com/NEU-DreamChasers)

---

## 🙏 Cảm ơn

Cảm ơn bạn đã dành thời gian đóng góp cho **X-Smart**! 

Mọi đóng góp, dù lớn hay nhỏ, đều được trân trọng và giúp dự án phát triển tốt hơn. 🚀

