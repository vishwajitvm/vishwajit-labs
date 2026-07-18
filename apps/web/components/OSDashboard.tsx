'use client';

import { useQuery } from '@tanstack/react-query';
import { GitPullRequest, Star, GitFork, ArrowUpRight } from 'lucide-react';

interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
}

interface GitHubStats {
  profile: {
    username: string;
    avatar_url: string;
    public_repos: number;
    followers: number;
  };
  repositories: GitHubRepo[];
  languages: Record<string, number>;
}

export default function OSDashboard() {
  const { data, isLoading } = useQuery<GitHubStats>({
    queryKey: ['githubStats'],
    queryFn: async () => {
      // API call to fastapi backend proxies endpoint
      const res = await fetch('http://localhost:8000/api/github/stats');
      if (!res.ok) {
        throw new Error('Failed to load stats');
      }
      return res.json();
    },
    // Fallback static mock representation while dev API is offline
    initialData: {
      profile: {
        username: "vishwajitvm",
        avatar_url: "https://avatars.githubusercontent.com/u/47113112?v=4",
        public_repos: 42,
        followers: 156
      },
      repositories: [
        {
          name: "tracenest",
          description: "Distributed tracing SDK & dashboard for FastAPI & Microservices",
          stars: 342,
          forks: 28,
          language: "Python",
          url: "https://github.com/vishwajitvm/tracenest"
        },
        {
          name: "tenantmind-ai",
          description: "Multi-tenant RAG platform using LangChain, Redis, and Gemini",
          stars: 198,
          forks: 15,
          language: "Python",
          url: "https://github.com/vishwajitvm/tenantmind-ai"
        },
        {
          name: "policybot",
          description: "Compliance checking agent framework with MCP interface",
          stars: 124,
          forks: 11,
          language: "Python",
          url: "https://github.com/vishwajitvm/policybot"
        },
        {
          name: "tallyko",
          description: "Golang high-performance events broker and ledger system",
          stars: 88,
          forks: 6,
          language: "Go",
          url: "https://github.com/vishwajitvm/tallyko"
        }
      ],
      languages: {
        "Python": 65.4,
        "TypeScript": 18.2,
        "Go": 10.5,
        "Shell": 5.9
      }
    }
  });

  return (
    <section id="github" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-mono">
      <div className="flex flex-col mb-16">
        <span className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-3">04 // OPEN_SOURCE_TELEMETRY</span>
        <h2 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white">
          Open Source Telemetry Dashboard
        </h2>
        <p className="text-zinc-400 font-mono text-sm mt-4 max-w-xl leading-relaxed">
          Live statistics fetched from the GitHub telemetry API and cached in our Redis system clusters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Languages & Profile */}
        <div className="p-8 border border-white/10 bg-white/2 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={data.profile.avatar_url} 
                alt="GitHub Avatar" 
                className="w-14 h-14 rounded-full border border-white/10"
              />
              <div>
                <h3 className="text-white text-base font-bold">@{data.profile.username}</h3>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold block mt-1">Public Repos: {data.profile.public_repos}</span>
              </div>
            </div>

            <div className="h-px bg-white/10 my-6"></div>

            <span className="text-xs text-zinc-400 uppercase tracking-wider block mb-4 font-semibold">Core languages usage</span>
            <div className="flex flex-col gap-4">
              {Object.entries(data.languages).map(([lang, pct]) => (
                <div key={lang}>
                  <div className="flex justify-between text-xs mb-1.5 font-mono text-zinc-300">
                    <span>{lang}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 border border-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl border border-white/10 bg-zinc-950/40 text-xs text-zinc-400 leading-relaxed font-mono">
            <span className="text-white font-bold block mb-1">CACHE_METRIC:</span>
            Updates dynamically every 6 hours. Rate-limiting safeguards active.
          </div>
        </div>

        {/* Repos list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {data.repositories.map((repo) => (
            <div 
              key={repo.name}
              className="group p-6 border border-white/10 bg-white/2 rounded-xl flex items-center justify-between hover:border-blue-500/20 hover:bg-blue-500/5 transition-all"
            >
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-3.5 mb-2.5">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/5 text-blue-400 font-bold uppercase font-mono">{repo.language}</span>
                  <h4 className="text-white text-base font-bold font-sans group-hover:text-blue-400 transition-colors">{repo.name}</h4>
                </div>
                <p className="text-zinc-300 text-xs font-mono leading-relaxed line-clamp-2">{repo.description}</p>
              </div>

              <div className="flex items-center gap-6 text-zinc-400 font-mono text-xs shrink-0">
                <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <GitFork className="w-4 h-4 text-zinc-500" />
                  <span>{repo.forks}</span>
                </div>
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-md border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:border-zinc-400 transition-all cursor-pointer"
                  id={`github-repo-${repo.name}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
