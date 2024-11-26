export function LiveProfile({ data }: { data: any }) {
  return (
    <div className="p-6 bg-card rounded-lg transition-all duration-300">
      <div className="mb-6 pb-4 transition-all duration-300">
        {!data?.name ? (
          <div className="animate-pulse">
            <div className="h-8 w-2/3 bg-muted rounded mb-2" />
            <div className="h-4 w-1/3 bg-muted rounded" />
          </div>
        ) : (
          <div 
            style={{
              borderBottom: data?.details?.favoriteColor?.hex 
                ? `2px solid ${data.details.favoriteColor.hex}`
                : '2px solid transparent',
              boxShadow: data?.details?.favoriteColor?.hex 
                ? '0 1px 0 rgba(255,255,255,0.1)'
                : 'none'
            }}
          >
            <h2 className="text-2xl font-bold text-foreground animate-[fadeIn_0.5s_ease-out]">
              {data.name}
            </h2>
            {data.details?.location && (
              <div className="text-sm text-muted-foreground mt-1 animate-[fadeIn_0.5s_ease-out]">
                📍 {data.details.location}
              </div>
            )}
          </div>
        )}
      </div>

      {!data?.bio ? (
        <div className="mb-6 animate-pulse">
          <div className="h-4 bg-muted rounded mb-2 w-full" />
          <div className="h-4 bg-muted rounded mb-2 w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      ) : (
        <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
          <p className="text-foreground/90 italic">
            "{data.bio}"
          </p>
        </div>
      )}

      {!data?.details?.favoriteColor ? (
        <div className="mb-6 animate-pulse flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 animate-[fadeIn_0.5s_ease-out]">
          <div 
            className="w-6 h-6 rounded-full border border-border"
            style={{ 
              backgroundColor: data.details.favoriteColor.hex,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)'
            }}
          />
          <span className="text-sm text-muted-foreground">
            Favorite color: {data.details.favoriteColor.name}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 text-foreground">Skills</h3>
        {!data?.skills?.length ? (
          <div className="flex flex-wrap gap-2 animate-pulse">
            <div className="h-6 w-24 bg-muted rounded-full" />
            <div className="h-6 w-32 bg-muted rounded-full" />
            <div className="h-6 w-28 bg-muted rounded-full" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill: any, i: number) => (
              <div 
                key={i}
                className="px-3 py-1 rounded-full text-sm animate-[fadeIn_0.5s_ease-out] bg-muted text-foreground"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  backgroundColor: data.details?.favoriteColor?.hex 
                    ? `${data.details.favoriteColor.hex}15`
                    : undefined,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.1)'
                }}
              >
                {skill.name}
                {skill.level && (
                  <span className="ml-1 opacity-75">• {skill.level}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">Hobbies</h3>
        {!data?.hobbies?.length ? (
          <div className="space-y-2 animate-pulse">
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.hobbies.map((hobby: any, i: number) => (
              <div 
                key={i}
                className="flex items-center gap-2 text-sm animate-[fadeIn_0.5s_ease-out]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-muted-foreground">
                  {hobby.category}:
                </span>
                <span className="text-foreground">{hobby.activity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 