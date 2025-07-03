import { Octokit } from '@octokit/rest';
import type { ClothingItem, GitHubIssue } from '../types';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const REPO_OWNER = 'today-self-study';
const REPO_NAME = 'aivatar';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export async function createClothingIssue(item: ClothingItem): Promise<GitHubIssue> {
  const title = `[의상] ${item.name} - ${item.brand}`;
  
  const body = `
## 의상 정보

**상품명:** ${item.name}
**브랜드:** ${item.brand}
**카테고리:** ${item.category}
**가격:** ${item.price.toLocaleString()}원
**링크:** ${item.originalUrl}

**색상:** ${item.colors.join(', ')}
**사이즈:** ${item.sizes.join(', ')}
**태그:** ${item.tags.join(', ')}

**설명:**
${item.description}

---

> 이 이슈는 AIVATAR 시스템에서 자동으로 생성되었습니다.
> 생성일: ${new Date(item.createdAt).toLocaleDateString('ko-KR')}
`;

  try {
    const response = await octokit.rest.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title,
      body,
      labels: [
        'clothing-item',
        `category:${item.category}`,
        `brand:${item.brand}`,
        ...item.colors.map(color => `color:${color}`),
        ...item.tags.map(tag => `tag:${tag}`)
      ]
    });

    return {
      number: response.data.number,
      title: response.data.title,
      body: response.data.body || '',
      labels: response.data.labels.map(label => 
        typeof label === 'string' ? label : label.name || ''
      ),
      url: response.data.html_url,
      createdAt: response.data.created_at
    };
  } catch (error) {
    console.error('Failed to create GitHub issue:', error);
    throw new Error('의상 정보를 GitHub에 저장하는데 실패했습니다.');
  }
}

export async function getClothingIssues(): Promise<GitHubIssue[]> {
  try {
    const response = await octokit.rest.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      labels: 'clothing-item',
      state: 'open',
      per_page: 100
    });

    return response.data.map(issue => ({
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      labels: issue.labels.map(label => 
        typeof label === 'string' ? label : label.name || ''
      ),
      url: issue.html_url,
      createdAt: issue.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch GitHub issues:', error);
    throw new Error('GitHub에서 의상 정보를 불러오는데 실패했습니다.');
  }
}

export async function updateClothingIssue(
  issueNumber: number, 
  item: ClothingItem
): Promise<GitHubIssue> {
  const title = `[의상] ${item.name} - ${item.brand}`;
  
  const body = `
## 의상 정보

**상품명:** ${item.name}
**브랜드:** ${item.brand}
**카테고리:** ${item.category}
**가격:** ${item.price.toLocaleString()}원
**링크:** ${item.originalUrl}

**색상:** ${item.colors.join(', ')}
**사이즈:** ${item.sizes.join(', ')}
**태그:** ${item.tags.join(', ')}

**설명:**
${item.description}

---

> 이 이슈는 AIVATAR 시스템에서 자동으로 업데이트되었습니다.
> 수정일: ${new Date().toLocaleDateString('ko-KR')}
`;

  try {
    const response = await octokit.rest.issues.update({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: issueNumber,
      title,
      body,
      labels: [
        'clothing-item',
        `category:${item.category}`,
        `brand:${item.brand}`,
        ...item.colors.map(color => `color:${color}`),
        ...item.tags.map(tag => `tag:${tag}`)
      ]
    });

    return {
      number: response.data.number,
      title: response.data.title,
      body: response.data.body || '',
      labels: response.data.labels.map(label => 
        typeof label === 'string' ? label : label.name || ''
      ),
      url: response.data.html_url,
      createdAt: response.data.created_at
    };
  } catch (error) {
    console.error('Failed to update GitHub issue:', error);
    throw new Error('의상 정보를 업데이트하는데 실패했습니다.');
  }
}

export async function deleteClothingIssue(issueNumber: number): Promise<void> {
  try {
    await octokit.rest.issues.update({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: issueNumber,
      state: 'closed'
    });
  } catch (error) {
    console.error('Failed to delete GitHub issue:', error);
    throw new Error('의상 정보를 삭제하는데 실패했습니다.');
  }
}

export function parseIssueToClothingItem(issue: GitHubIssue): ClothingItem | null {
  try {
    const body = issue.body;
    
    // 이슈 본문에서 정보 추출
    const nameMatch = body.match(/\*\*상품명:\*\* (.+)/);
    const brandMatch = body.match(/\*\*브랜드:\*\* (.+)/);
    const categoryMatch = body.match(/\*\*카테고리:\*\* (.+)/);
    const priceMatch = body.match(/\*\*가격:\*\* (.+)원/);
    const linkMatch = body.match(/\*\*링크:\*\* (.+)/);
    const colorsMatch = body.match(/\*\*색상:\*\* (.+)/);
    const sizesMatch = body.match(/\*\*사이즈:\*\* (.+)/);
    const tagsMatch = body.match(/\*\*태그:\*\* (.+)/);
    const descriptionMatch = body.match(/\*\*설명:\*\*\s*\n(.+?)\n\n---/s);

    if (!nameMatch || !brandMatch || !categoryMatch || !priceMatch || !linkMatch) {
      return null;
    }

    return {
      id: issue.number.toString(),
      name: nameMatch[1],
      brand: brandMatch[1],
      category: categoryMatch[1] as any,
      price: parseInt(priceMatch[1].replace(/,/g, '')),
      originalUrl: linkMatch[1],
      imageUrl: '', // 이미지 URL은 별도로 추출해야 함
      description: descriptionMatch?.[1] || '',
      colors: colorsMatch ? colorsMatch[1].split(', ') : [],
      sizes: sizesMatch ? sizesMatch[1].split(', ') : [],
      tags: tagsMatch ? tagsMatch[1].split(', ') : [],
      createdAt: issue.createdAt,
      githubIssueNumber: issue.number
    };
  } catch (error) {
    console.error('Failed to parse issue to clothing item:', error);
    return null;
  }
}

export async function syncClothingItems(): Promise<ClothingItem[]> {
  try {
    const issues = await getClothingIssues();
    const items = issues
      .map(issue => parseIssueToClothingItem(issue))
      .filter((item): item is ClothingItem => item !== null);
    
    return items;
  } catch (error) {
    console.error('Failed to sync clothing items:', error);
    return [];
  }
}

// 로컬 저장소와 GitHub 동기화
export async function syncWithGitHub(localItems: ClothingItem[]): Promise<ClothingItem[]> {
  try {
    const githubItems = await syncClothingItems();
    const githubItemsMap = new Map(githubItems.map(item => [item.id, item]));
    
    // 로컬에만 있는 아이템들을 GitHub에 업로드
    const newItems: ClothingItem[] = [];
    
    for (const localItem of localItems) {
      if (!githubItemsMap.has(localItem.id)) {
        try {
          const issue = await createClothingIssue(localItem);
          const updatedItem = { ...localItem, githubIssueNumber: issue.number };
          newItems.push(updatedItem);
        } catch (error) {
          console.error('Failed to sync item to GitHub:', error);
          newItems.push(localItem);
        }
      } else {
        newItems.push(githubItemsMap.get(localItem.id)!);
      }
    }
    
    // GitHub에만 있는 아이템들 추가
    for (const githubItem of githubItems) {
      if (!localItems.find(item => item.id === githubItem.id)) {
        newItems.push(githubItem);
      }
    }
    
    return newItems;
  } catch (error) {
    console.error('Failed to sync with GitHub:', error);
    return localItems;
  }
} 